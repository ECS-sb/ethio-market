import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { FOLDERS, type Folder, type InboxParams } from "@/lib/telegram/folders";
import { WITHDRAWAL_TAG } from "@/lib/telegram/profile";
import { replyStats, startOfTodayInAddis } from "@/lib/telegram/stats";

export const INBOX_LIMIT = 100;

function folderWhere(folder: Folder): Prisma.TelegramChatWhereInput {
  switch (folder) {
    case "waiting":
      return { lastDirection: "IN" };
    case "alerts":
      return { alerts: { some: { resolved: false } } };
    case "progress":
      return { deals: { some: { status: { in: ["NEGOTIATING", "AGREED"] } } } };
    case "paid":
      return { deals: { some: { status: { in: ["PAID", "DELIVERED"] } } } };
    case "sales":
      return { deals: { some: { kind: "SALE", status: { not: "CANCELLED" } } } };
    case "registrations":
      return { deals: { some: { kind: "REGISTRATION", status: { not: "CANCELLED" } } } };
    case "withdrawals":
      return { tags: { has: WITHDRAWAL_TAG } };
    case "receipts":
      return { messages: { some: { receipt: { is: { isReceipt: true } } } } };
    default:
      return {};
  }
}

/** ደንበኛው ከሰራተኛው የመጨረሻ ምላሽ በኋላ የላካቸው መልዕክቶች (እንደ ቴሌግራም ያልተነበቡ ቁጥር)። */
async function waitingCounts(chatIds: string[]): Promise<Map<string, number>> {
  if (chatIds.length === 0) return new Map();
  const rows = await db.$queryRaw<{ chatId: string; count: number }[]>`
    SELECT m."chatId" AS "chatId", COUNT(*)::int AS "count"
    FROM telegram_message m
    JOIN telegram_chat c ON c.id = m."chatId"
    WHERE m."chatId" = ANY(${chatIds})
      AND m.direction = 'IN'
      AND m."sentAt" > COALESCE(c."lastOutboundAt", 'epoch'::timestamp)
    GROUP BY m."chatId"`;
  return new Map(rows.map((row) => [row.chatId, row.count]));
}

export async function getInbox(params: InboxParams) {
  const byAccount: Prisma.TelegramChatWhereInput = params.account ? { connectionId: params.account } : {};
  const bySearch: Prisma.TelegramChatWhereInput = params.q
    ? { OR: [{ name: { contains: params.q, mode: "insensitive" } }, { username: { contains: params.q, mode: "insensitive" } }] }
    : {};

  const [connections, folderCounts, chats, todayMessages] = await Promise.all([
    db.telegramConnection.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, ownerName: true, ownerUsername: true, isEnabled: true } }),
    Promise.all(FOLDERS.map((folder) => db.telegramChat.count({ where: { AND: [byAccount, folderWhere(folder)] } }))),
    db.telegramChat.findMany({
      where: { AND: [byAccount, folderWhere(params.folder), bySearch] },
      orderBy: { lastMessageAt: "desc" },
      take: INBOX_LIMIT,
      select: {
        id: true,
        name: true,
        username: true,
        lastMessageAt: true,
        lastDirection: true,
        lastInboundAt: true,
        connection: { select: { ownerName: true } },
        messages: { orderBy: [{ sentAt: "desc" }, { messageId: "desc" }], take: 1, select: { text: true, mediaType: true, direction: true, deletedAt: true } },
        deals: { orderBy: { dealAt: "desc" }, take: 1, select: { kind: true, status: true, amountEtb: true, item: true, paidToCompany: true } },
        alerts: { where: { resolved: false }, orderBy: { createdAt: "desc" }, take: 1, select: { type: true, evidence: true, messageId: true } },
        _count: { select: { alerts: { where: { resolved: false } } } },
      },
    }),
    db.telegramMessage.findMany({
      where: { sentAt: { gte: startOfTodayInAddis() }, ...(params.account ? { chat: { connectionId: params.account } } : {}) },
      orderBy: { sentAt: "asc" },
      select: { chatId: true, direction: true, sentAt: true },
    }),
  ]);

  const waiting = await waitingCounts(chats.map((chat) => chat.id));
  const counts = Object.fromEntries(FOLDERS.map((folder, index) => [folder, folderCounts[index]])) as Record<Folder, number>;

  return {
    connections,
    counts,
    chats: chats.map((chat) => ({ ...chat, waitingCount: waiting.get(chat.id) ?? 0 })),
    truncated: chats.length === INBOX_LIMIT,
    today: {
      inbound: todayMessages.filter((message) => message.direction === "IN").length,
      outbound: todayMessages.filter((message) => message.direction === "OUT").length,
      replies: replyStats(todayMessages),
    },
  };
}

export type Inbox = Awaited<ReturnType<typeof getInbox>>;
