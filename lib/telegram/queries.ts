import "server-only";
import { db } from "@/lib/db";
import { aiEnabled, AI_MODEL } from "@/lib/telegram/ai";
import { countPending } from "@/lib/telegram/analyze";
import { replyStats, startOfTodayInAddis, summarizeDeals } from "@/lib/telegram/stats";

const DAY = 24 * 60 * 60 * 1000;

export async function getTelegramSales() {
  const now = Date.now();
  const today = startOfTodayInAddis();
  const weekAgo = new Date(now - 7 * DAY);
  const [deals, pending] = await Promise.all([
    db.telegramDeal.findMany({
      where: { dealAt: { gte: new Date(now - 30 * DAY) } },
      orderBy: { dealAt: "desc" },
      take: 300,
      select: {
        id: true,
        kind: true,
        item: true,
        amountEtb: true,
        status: true,
        paidToCompany: true,
        customerName: true,
        customerPhone: true,
        note: true,
        dealAt: true,
        chat: { select: { id: true, name: true, username: true, connection: { select: { ownerName: true } } } },
      },
    }),
    countPending(),
  ]);
  return {
    deals,
    today: summarizeDeals(deals.filter((deal) => deal.dealAt >= today)),
    week: summarizeDeals(deals.filter((deal) => deal.dealAt >= weekAgo)),
    pending,
    aiEnabled: aiEnabled(),
    model: AI_MODEL,
  };
}

export async function getTelegramOverview() {
  const today = startOfTodayInAddis();
  const [connections, todayMessages, waiting, openAlerts, alerts, chats] = await Promise.all([
    db.telegramConnection.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, ownerName: true, ownerUsername: true, isEnabled: true, canReply: true },
    }),
    db.telegramMessage.findMany({ where: { sentAt: { gte: today } }, orderBy: { sentAt: "asc" }, select: { chatId: true, direction: true, sentAt: true } }),
    db.telegramChat.count({ where: { lastDirection: "IN" } }),
    db.telegramAlert.count({ where: { resolved: false } }),
    db.telegramAlert.findMany({
      where: { resolved: false },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 50,
      select: {
        id: true,
        type: true,
        severity: true,
        evidence: true,
        createdAt: true,
        chat: { select: { id: true, name: true, connection: { select: { ownerName: true } } } },
        message: { select: { text: true } },
      },
    }),
    db.telegramChat.findMany({
      orderBy: { lastMessageAt: "desc" },
      take: 30,
      select: {
        id: true,
        name: true,
        username: true,
        lastMessageAt: true,
        lastDirection: true,
        connection: { select: { ownerName: true } },
        messages: { orderBy: [{ sentAt: "desc" }, { messageId: "desc" }], take: 1, select: { text: true, mediaType: true, direction: true } },
        _count: { select: { alerts: { where: { resolved: false } } } },
      },
    }),
  ]);

  // የሰራተኛ (OUT) መልዕክቶች ቁጥር 0 ከሆነ ቴሌግራም የላኳቸውን መልዕክቶች ለቦቱ እንደማይልክ ያሳያል።
  const connectionCounts = await Promise.all(
    connections.map(async (connection) => {
      const [inbound, outbound] = await Promise.all([
        db.telegramMessage.count({ where: { chat: { connectionId: connection.id }, direction: "IN" } }),
        db.telegramMessage.count({ where: { chat: { connectionId: connection.id }, direction: "OUT" } }),
      ]);
      return { ...connection, inbound, outbound };
    })
  );

  return {
    connections: connectionCounts,
    inboundToday: todayMessages.filter((message) => message.direction === "IN").length,
    outboundToday: todayMessages.filter((message) => message.direction === "OUT").length,
    replies: replyStats(todayMessages),
    waiting,
    openAlerts,
    alerts,
    chats,
  };
}

export const TELEGRAM_CHAT_PAGE = 300;

export async function getTelegramChat(id: string) {
  const chat = await db.telegramChat.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      aiSummary: true,
      analyzedAt: true,
      connection: { select: { ownerName: true, ownerUsername: true } },
      deals: {
        orderBy: { dealAt: "desc" },
        select: { id: true, kind: true, item: true, amountEtb: true, status: true, paidToCompany: true, note: true, dealAt: true },
      },
      alerts: {
        orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
        select: { id: true, type: true, severity: true, evidence: true, resolved: true, createdAt: true, messageId: true },
      },
    },
  });
  if (!chat) return null;
  const messages = await db.telegramMessage.findMany({
    where: { chatId: id },
    orderBy: [{ sentAt: "desc" }, { messageId: "desc" }],
    take: TELEGRAM_CHAT_PAGE,
    select: {
      id: true,
      direction: true,
      senderName: true,
      viaBot: true,
      text: true,
      mediaType: true,
      sentAt: true,
      editedAt: true,
      previousText: true,
      deletedAt: true,
      receipt: {
        select: { isReceipt: true, provider: true, amountEtb: true, recipientName: true, recipientAccount: true, transactionId: true, toCompany: true },
      },
    },
  });
  const flagged = new Set(chat.alerts.filter((alert) => !alert.resolved && alert.messageId).map((alert) => alert.messageId));
  return {
    ...chat,
    messages: messages.reverse().map((message) => ({ ...message, flagged: flagged.has(message.id) })),
    truncated: messages.length === TELEGRAM_CHAT_PAGE,
    aiEnabled: aiEnabled(),
  };
}
