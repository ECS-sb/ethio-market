import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { aiEnabled, analyzeTranscript, readReceipt } from "@/lib/telegram/ai";
import { downloadTelegramFile } from "@/lib/telegram/api";
import { decideToCompany, describeCompany, loadCompanyProfile } from "@/lib/telegram/company";
import { normalizePhone, type Finding } from "@/lib/telegram/detect";
import { canHoldReceipt, recordAlerts, type NewAlert } from "@/lib/telegram/ingest";
import { extractContactDetails, mentionsWithdrawal, mergeProfile, readProfile, WITHDRAWAL_TAG } from "@/lib/telegram/profile";
import { buildTranscript } from "@/lib/telegram/transcript";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 20 * 1024 * 1024;
/** Claude የሚያየው የቻቱ የመጨረሻዎቹ መልዕክቶች ብዛት። ከዚያ በፊት የተገኙ ስምምነቶች ባሉበት ይቆያሉ። */
const TRANSCRIPT_MESSAGES = 150;
const RECEIPT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];
const DAY = 24 * 60 * 60 * 1000;

function describeError(error: unknown): string {
  if (error instanceof Anthropic.APIError) return `Claude API ${error.status}: ${error.message}`;
  return error instanceof Error ? error.message : String(error);
}

export type ReceiptOutcome = { alerts: NewAlert[]; chatId: string | null; isReceipt: boolean };

/** ደንበኛ የላከውን ፎቶ/PDF ያነባል፤ ወደ ሌላ ሂሳብ የተከፈለ ወይም ሁለት ጊዜ የቀረበ ደረሰኝ ከሆነ ማስጠንቀቂያ ያነሳል። */
export async function analyzeReceiptMessage(messageRowId: string): Promise<ReceiptOutcome> {
  const none: ReceiptOutcome = { alerts: [], chatId: null, isReceipt: false };
  if (!aiEnabled()) return none;
  const message = await db.telegramMessage.findUnique({
    where: { id: messageRowId },
    select: {
      id: true,
      text: true,
      direction: true,
      mediaType: true,
      mimeType: true,
      fileId: true,
      receipt: { select: { id: true } },
      chat: { select: { id: true, name: true, connection: { select: { ownerName: true } } } },
    },
  });
  if (!message || message.receipt || !message.fileId || message.direction !== "IN") return none;
  if (!canHoldReceipt(message.mediaType, message.mimeType)) return none;

  const mimeType = message.mimeType ?? "image/jpeg";
  const bytes = await downloadTelegramFile(message.fileId, mimeType === "application/pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES);
  if (!bytes) {
    console.warn(`telegram ai receipt: file for message ${message.id} is too large or missing`);
    return none;
  }

  const company = loadCompanyProfile();
  const reading = await readReceipt({ bytes, mimeType }, describeCompany(company));
  if (!reading) return none;
  const toCompany = decideToCompany(reading, company);
  const transactionId = reading.transaction_id?.trim() || null;
  await db.telegramReceipt.upsert({
    where: { messageId: message.id },
    create: {
      messageId: message.id,
      isReceipt: reading.is_payment_receipt,
      provider: reading.provider,
      amountEtb: reading.amount_etb,
      recipientName: reading.recipient_name,
      recipientAccount: reading.recipient_account,
      payerName: reading.payer_name,
      transactionId,
      paidAt: reading.paid_at,
      toCompany,
    },
    update: {},
  });
  if (!reading.is_payment_receipt) return { alerts: [], chatId: message.chat.id, isReceipt: false };

  const findings: Finding[] = [];
  if (toCompany === false) {
    const recipient = [reading.recipient_name, reading.recipient_account].filter(Boolean).join(" ") || "?";
    const amount = reading.amount_etb === null ? "?" : reading.amount_etb.toLocaleString("en-US");
    findings.push({ type: "PAYMENT_TO_OTHER_ACCOUNT", severity: "HIGH", evidence: `${amount} ETB → ${recipient}` });
  }
  if (transactionId) {
    const earlier = await db.telegramReceipt.findFirst({
      where: { transactionId, isReceipt: true, messageId: { not: message.id } },
      select: { id: true },
    });
    if (earlier) findings.push({ type: "DUPLICATE_RECEIPT", severity: "HIGH", evidence: transactionId });
  }
  const alerts = await recordAlerts(message.chat, message.id, message.chat.connection.ownerName, message.text, findings);
  return { alerts, chatId: message.chat.id, isReceipt: true };
}

/** ቻቱን ለClaude ሰጥቶ ሽያጮችን/ምዝገባዎችን ያወጣል፤ ማጠቃለያና የሽሽጥ ጥርጣሬ ያስቀምጣል። */
export async function analyzeChat(chatRowId: string): Promise<boolean> {
  if (!aiEnabled()) return false;
  const chat = await db.telegramChat.findUnique({
    where: { id: chatRowId },
    select: { id: true, name: true, profile: true, tags: true, connection: { select: { ownerName: true } } },
  });
  if (!chat) return false;
  const startedAt = new Date();
  const rows = await db.telegramMessage.findMany({
    where: { chatId: chat.id },
    orderBy: [{ sentAt: "desc" }, { messageId: "desc" }],
    take: TRANSCRIPT_MESSAGES,
    select: {
      id: true,
      direction: true,
      viaBot: true,
      text: true,
      mediaType: true,
      sentAt: true,
      deletedAt: true,
      previousText: true,
      receipt: {
        select: { isReceipt: true, provider: true, amountEtb: true, recipientName: true, recipientAccount: true, transactionId: true, toCompany: true },
      },
    },
  });
  const messages = rows.reverse();
  // አንድ መልዕክት ብቻ ያለው ቻት ገና የሚተነተን ነገር የለውም።
  if (messages.length < 2) {
    await db.telegramChat.update({ where: { id: chat.id }, data: { analyzedAt: startedAt } });
    return false;
  }

  const company = loadCompanyProfile();
  const header = `Customer: ${chat.name}\nCompany Telegram account: ${chat.connection.ownerName}`;
  const result = await analyzeTranscript(header, buildTranscript(messages), describeCompany(company));
  if (!result) return false;

  const byNumber = (numbers: number[]) => numbers.map((number) => messages[number - 1]).filter((message) => message !== undefined);
  const lastMessage = messages[messages.length - 1];
  const deals = result.deals.map((deal) => {
    const evidence = byNumber(deal.evidence_message_numbers);
    const dealAt = evidence.reduce((latest, message) => (message.sentAt > latest ? message.sentAt : latest), evidence[0]?.sentAt ?? lastMessage.sentAt);
    // የተነበበ ደረሰኝ ከClaude ግምት ይቀድማል።
    const verdicts = evidence.filter((message) => message.receipt?.isReceipt).map((message) => message.receipt?.toCompany ?? null);
    const paidToCompany = verdicts.includes(false) ? false : verdicts.includes(true) ? true : deal.paid_to_company;
    const amount = deal.amount_etb;
    return {
      chatId: chat.id,
      kind: deal.kind,
      item: deal.item.slice(0, 300),
      amountEtb: amount !== null && amount > 0 && amount < 1_000_000_000 ? amount : null,
      status: deal.status,
      paidToCompany,
      customerName: deal.customer_name?.slice(0, 200) ?? null,
      customerPhone: deal.customer_phone?.slice(0, 50) ?? null,
      note: deal.note.slice(0, 500),
      dealAt,
    };
  });

  // የደንበኛው ዝርዝሮች፦ ከመልዕክቶቹ በህግ የተገኙት እና Claude ያወጣቸው (ለሽያጭ ያመጣቸውን የሚለየው Claude ነው)።
  const isCompanyPhone = (phone: string) => company.allow.phones.has(phone);
  let profile = readProfile(chat.profile);
  for (const message of messages) {
    if (message.direction === "IN") profile = mergeProfile(profile, extractContactDetails(message.text));
  }
  const shared = result.customer;
  const cleanAccount = (account: { platform: string; handle_or_link: string }) => ({ platform: account.platform.trim() || "Other", value: account.handle_or_link.trim() });
  profile = mergeProfile(profile, {
    phones: shared.phones.map((phone) => normalizePhone(phone) ?? phone.trim()).filter((phone) => phone && !isCompanyPhone(phone)),
    emails: shared.emails.map((email) => email.trim().toLowerCase()).filter(Boolean),
    forSale: shared.accounts_for_sale
      .filter((account) => account.handle_or_link.trim())
      .map((account) => ({ ...cleanAccount(account), ...(account.details.trim() ? { details: account.details.trim().slice(0, 200) } : {}) })),
    accounts: shared.other_accounts.filter((account) => account.handle_or_link.trim()).map(cleanAccount),
    notes: shared.notes,
  });
  profile = { ...profile, phones: profile.phones.filter((phone) => !isCompanyPhone(phone)) };
  const withdrawal = result.topics.length > 0 || messages.some((message) => mentionsWithdrawal(message.text));
  const tags = withdrawal && !chat.tags.includes(WITHDRAWAL_TAG) ? [...chat.tags, WITHDRAWAL_TAG] : chat.tags;

  await db.$transaction([
    db.telegramDeal.deleteMany({ where: { chatId: chat.id, dealAt: { gte: messages[0].sentAt } } }),
    db.telegramDeal.createMany({ data: deals }),
    // የትንተናው መጀመሪያ ጊዜ ይመዘገባል፤ በትንተናው ጊዜ የመጡ መልዕክቶች በቀጣዩ ዙር ይታያሉ።
    db.telegramChat.update({
      where: { id: chat.id },
      data: { aiSummary: result.summary.slice(0, 1000), analyzedAt: startedAt, profile, tags },
    }),
  ]);

  const suspicion = result.side_deal_suspicion;
  if (suspicion.suspected) {
    const involved = byNumber(suspicion.message_numbers);
    const anchor = involved.at(-1) ?? [...messages].reverse().find((message) => message.direction === "OUT") ?? lastMessage;
    const existing = await db.telegramAlert.findFirst({ where: { messageId: anchor.id, type: "AI_SUSPICION" }, select: { id: true } });
    if (!existing) {
      await recordAlerts(chat, anchor.id, chat.connection.ownerName, anchor.text, [
        { type: "AI_SUSPICION", severity: "MEDIUM", evidence: suspicion.reason.slice(0, 300) || "—" },
      ]);
    }
  }
  return true;
}

async function eachLimited<T>(items: T[], limit: number, work: (item: T) => Promise<void>) {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      await work(item);
    }
  });
  await Promise.all(workers);
}

function pendingReceiptsWhere() {
  return {
    direction: "IN" as const,
    receipt: null,
    fileId: { not: null },
    sentAt: { gte: new Date(Date.now() - 7 * DAY) },
    OR: [{ mediaType: "photo" }, { mediaType: "document", mimeType: { in: RECEIPT_MIME_TYPES } }],
  };
}

function pendingChatsWhere() {
  return { OR: [{ analyzedAt: null }, { lastMessageAt: { gt: db.telegramChat.fields.analyzedAt } }] };
}

export async function countPending() {
  const [receipts, chats] = await Promise.all([
    db.telegramMessage.count({ where: pendingReceiptsWhere() }),
    db.telegramChat.count({ where: pendingChatsWhere() }),
  ]);
  return { receipts, chats };
}

/** ያልተነበቡ ደረሰኞችንና አዲስ መልዕክት ያላቸውን ቻቶች ይተነትናል (ለዕለታዊው cron እና ለአድሚን አዝራር)። */
export async function analyzePending({ receipts = 20, chats = 40, concurrency = 4 } = {}) {
  const alerts: NewAlert[] = [];
  if (!aiEnabled()) return { receipts: 0, chats: 0, alerts };

  const receiptRows = await db.telegramMessage.findMany({ where: pendingReceiptsWhere(), orderBy: { sentAt: "desc" }, take: receipts, select: { id: true } });
  await eachLimited(receiptRows, concurrency, async ({ id }) => {
    try {
      alerts.push(...(await analyzeReceiptMessage(id)).alerts);
    } catch (error) {
      console.error(`telegram ai receipt ${id} failed:`, describeError(error));
    }
  });

  const chatRows = await db.telegramChat.findMany({ where: pendingChatsWhere(), orderBy: { lastMessageAt: "desc" }, take: chats, select: { id: true } });
  let analyzed = 0;
  await eachLimited(chatRows, concurrency, async ({ id }) => {
    try {
      if (await analyzeChat(id)) analyzed += 1;
    } catch (error) {
      console.error(`telegram ai chat ${id} failed:`, describeError(error));
    }
  });
  return { receipts: receiptRows.length, chats: analyzed, alerts };
}

/** ከwebhook፦ አዲስ ደረሰኝ ሲመጣ ወዲያውኑ ይነበባል፤ ደረሰኝ ከሆነ ቻቱም ይተነተናል (ክፍያ የሽያጭ ምልክት ነው)። */
export async function analyzeIncomingReceipts(messageRowIds: string[]): Promise<NewAlert[]> {
  const alerts: NewAlert[] = [];
  for (const id of messageRowIds) {
    try {
      const outcome = await analyzeReceiptMessage(id);
      alerts.push(...outcome.alerts);
      if (outcome.isReceipt && outcome.chatId) await analyzeChat(outcome.chatId);
    } catch (error) {
      console.error(`telegram ai receipt ${id} failed:`, describeError(error));
    }
  }
  return alerts;
}
