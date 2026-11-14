import "server-only";
import { db } from "@/lib/db";
import { getBusinessConnection } from "@/lib/telegram/api";
import { detectSideDeal, parseAllowlist, usernameFromEvidence, type Finding } from "@/lib/telegram/detect";
import type { TgBusinessConnection, TgBusinessMessagesDeleted, TgChat, TgMessage, TgUpdate, TgUser } from "@/lib/telegram/types";

/** ለባለቤቱ ወዲያውኑ የሚላክ አዲስ ከፍተኛ ማስጠንቀቂያ። */
export type NewAlert = Finding & { chatRowId: string; chatName: string; accountName: string; excerpt: string };

function userName(user: TgUser): string {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || (user.username ? `@${user.username}` : String(user.id));
}

function chatName(chat: TgChat): string {
  return [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.title || (chat.username ? `@${chat.username}` : String(chat.id));
}

function readContent(message: TgMessage) {
  const text = message.text ?? message.caption ?? "";
  // በጽሑፍ ውስጥ የተደበቁ ሊንኮች (text_link) ለምርመራው ይጨመራሉ።
  const hiddenLinks = [...(message.entities ?? []), ...(message.caption_entities ?? [])]
    .map((entity) => entity.url ?? (entity.user?.username ? `@${entity.user.username}` : null))
    .filter((value): value is string => Boolean(value));
  const media: [string, string | undefined][] = [
    ["photo", message.photo?.at(-1)?.file_id],
    ["document", message.document?.file_id],
    ["video", message.video?.file_id],
    ["video_note", message.video_note?.file_id],
    ["voice", message.voice?.file_id],
    ["audio", message.audio?.file_id],
    ["sticker", message.sticker?.file_id],
  ];
  const found = media.find(([, fileId]) => fileId);
  const mediaType = found?.[0] ?? (message.contact ? "contact" : message.location ? "location" : null);
  const contactText = message.contact ? `${message.contact.first_name} ${message.contact.phone_number}` : "";
  return {
    text: text || contactText,
    mediaType,
    fileId: found?.[1] ?? null,
    contactPhone: message.contact?.phone_number,
    scanText: [text, ...hiddenLinks].join("\n"),
  };
}

export async function saveConnection(connection: TgBusinessConnection) {
  const data = {
    ownerId: BigInt(connection.user.id),
    ownerChatId: BigInt(connection.user_chat_id),
    ownerName: userName(connection.user),
    ownerUsername: connection.user.username ?? null,
    canReply: connection.rights?.can_reply ?? connection.can_reply ?? false,
    isEnabled: connection.is_enabled,
    connectedAt: new Date(connection.date * 1000),
  };
  return db.telegramConnection.upsert({ where: { id: connection.id }, create: { id: connection.id, ...data }, update: data });
}

/** business_connection update ቢያመልጥ (ለምሳሌ webhook ከመዘጋጀቱ በፊት ከተገናኘ) ከቴሌግራም ይጠየቃል። */
async function ensureConnection(id: string) {
  const existing = await db.telegramConnection.findUnique({ where: { id } });
  return existing ?? saveConnection(await getBusinessConnection(id));
}

/** የድርጅቱ የራሱ አድራሻዎች፦ ከenv እና ከተገናኙት አካውንቶች የቴሌግራም ስሞች። */
async function loadAllowlist() {
  const allow = parseAllowlist(process.env.TELEGRAM_ALLOWED_CONTACTS);
  const connections = await db.telegramConnection.findMany({ select: { ownerUsername: true } });
  for (const { ownerUsername } of connections) if (ownerUsername) allow.usernames.add(ownerUsername.toLowerCase());
  return allow;
}

/** ለሽያጭ የቀረቡ አካውንቶች (Ethio Market listings) ሊንክ ሲላክ ማስጠንቀቂያ አይሆንም። */
async function dropListedAccounts(findings: Finding[]): Promise<Finding[]> {
  const usernames = findings
    .filter((finding) => finding.type === "TELEGRAM_CONTACT")
    .map((finding) => usernameFromEvidence(finding.evidence))
    .filter((value): value is string => Boolean(value));
  if (usernames.length === 0) return findings;
  const listed = await db.listing.findMany({ where: { username: { in: usernames } }, select: { username: true } });
  const known = new Set(listed.map((listing) => listing.username));
  return findings.filter((finding) => {
    if (finding.type !== "TELEGRAM_CONTACT") return true;
    const username = usernameFromEvidence(finding.evidence);
    return !username || !known.has(username);
  });
}

async function saveAlerts(chat: { id: string; name: string }, messageRowId: string | null, accountName: string, excerpt: string, findings: Finding[]) {
  if (findings.length === 0) return [];
  const existing = messageRowId
    ? await db.telegramAlert.findMany({ where: { messageId: messageRowId }, select: { type: true, evidence: true } })
    : [];
  const fresh = findings.filter((finding) => !existing.some((row) => row.type === finding.type && row.evidence === finding.evidence));
  if (fresh.length === 0) return [];
  await db.telegramAlert.createMany({
    data: fresh.map((finding) => ({ chatId: chat.id, messageId: messageRowId, ...finding })),
    skipDuplicates: true,
  });
  return fresh
    .filter((finding) => finding.severity === "HIGH")
    .map((finding): NewAlert => ({ ...finding, chatRowId: chat.id, chatName: chat.name, accountName, excerpt: excerpt.slice(0, 300) }));
}

async function saveMessage(message: TgMessage, isEdit: boolean): Promise<NewAlert[]> {
  if (!message.business_connection_id) return [];
  const connection = await ensureConnection(message.business_connection_id);
  const viaBot = Boolean(message.sender_business_bot);
  const outgoing = viaBot || (message.from !== undefined && BigInt(message.from.id) === connection.ownerId);
  const direction = outgoing ? "OUT" : "IN";
  const sentAt = new Date(message.date * 1000);
  const content = readContent(message);
  const name = chatName(message.chat);
  const directionTimes = outgoing ? { lastOutboundAt: sentAt } : { lastInboundAt: sentAt };

  const chat = await db.telegramChat.upsert({
    where: { connectionId_chatId: { connectionId: connection.id, chatId: BigInt(message.chat.id) } },
    create: {
      connectionId: connection.id,
      chatId: BigInt(message.chat.id),
      name,
      username: message.chat.username ?? null,
      lastMessageAt: sentAt,
      lastDirection: direction,
      ...directionTimes,
    },
    update: {
      name,
      username: message.chat.username ?? null,
      ...(isEdit ? {} : { lastMessageAt: sentAt, lastDirection: direction, ...directionTimes }),
    },
  });

  const key = { chatId_messageId: { chatId: chat.id, messageId: message.message_id } };
  const fields = {
    text: content.text,
    mediaType: content.mediaType,
    fileId: content.fileId,
  };
  const base = {
    chatId: chat.id,
    messageId: message.message_id,
    direction,
    senderName: message.from ? userName(message.from) : name,
    viaBot,
    sentAt,
    ...fields,
  } as const;

  let row: { id: string };
  if (isEdit) {
    const editedAt = new Date((message.edit_date ?? message.date) * 1000);
    const existing = await db.telegramMessage.findUnique({ where: key, select: { id: true, text: true, previousText: true } });
    row = existing
      ? await db.telegramMessage.update({
          where: { id: existing.id },
          data: { ...fields, editedAt, previousText: existing.text !== content.text ? existing.text : existing.previousText },
          select: { id: true },
        })
      : await db.telegramMessage.create({ data: { ...base, editedAt }, select: { id: true } });
  } else {
    // Telegram አንድን update ደግሞ ሊልክ ስለሚችል upsert ነው።
    row = await db.telegramMessage.upsert({ where: key, create: base, update: {}, select: { id: true } });
  }

  if (!outgoing) return [];
  const findings = await dropListedAccounts(detectSideDeal(content.scanText, await loadAllowlist(), { contactPhone: content.contactPhone }));
  return saveAlerts(chat, row.id, connection.ownerName, content.text, findings);
}

async function saveDeletion(deleted: TgBusinessMessagesDeleted): Promise<NewAlert[]> {
  const connection = await ensureConnection(deleted.business_connection_id);
  const now = new Date();
  const chat = await db.telegramChat.upsert({
    where: { connectionId_chatId: { connectionId: connection.id, chatId: BigInt(deleted.chat.id) } },
    // ቻቱ ከዚህ በፊት ካልታየ ምላሽ እንደሚጠብቅ እንዳይቆጠር OUT ተደርጎ ይፈጠራል።
    create: {
      connectionId: connection.id,
      chatId: BigInt(deleted.chat.id),
      name: chatName(deleted.chat),
      username: deleted.chat.username ?? null,
      lastMessageAt: now,
      lastDirection: "OUT",
    },
    update: {},
  });
  const rows = await db.telegramMessage.findMany({
    where: { chatId: chat.id, messageId: { in: deleted.message_ids } },
    select: { id: true, direction: true, text: true },
  });
  if (rows.length > 0) {
    await db.telegramMessage.updateMany({ where: { id: { in: rows.map((row) => row.id) }, deletedAt: null }, data: { deletedAt: now } });
  }
  const outgoing = rows.filter((row) => row.direction === "OUT");
  const anchor = outgoing[0] ?? rows[0] ?? null;
  const finding: Finding = {
    type: "DELETED_MESSAGE",
    severity: outgoing.length > 0 ? "HIGH" : "MEDIUM",
    evidence: String(deleted.message_ids.length),
  };
  return saveAlerts(chat, anchor?.id ?? null, connection.ownerName, anchor?.text ?? "", [finding]);
}

/** አንድን የቴሌግራም update ያስቀምጣል፤ ለባለቤቱ መላክ ያለባቸውን አዲስ ከፍተኛ ማስጠንቀቂያዎች ይመልሳል። */
export async function handleBusinessUpdate(update: TgUpdate): Promise<NewAlert[]> {
  const alerts: NewAlert[] = [];
  if (update.business_connection) await saveConnection(update.business_connection);
  if (update.business_message) alerts.push(...(await saveMessage(update.business_message, false)));
  if (update.edited_business_message) alerts.push(...(await saveMessage(update.edited_business_message, true)));
  if (update.deleted_business_messages) alerts.push(...(await saveDeletion(update.deleted_business_messages)));
  return alerts;
}
