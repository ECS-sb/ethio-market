import "server-only";
import { db } from "@/lib/db";
import { createT, localePath, type Locale, type T } from "@/lib/i18n";
import { escapeHtml, notifyOwners, ownerChatIds, sendMessage } from "@/lib/telegram/api";
import type { NewAlert } from "@/lib/telegram/ingest";
import { alertLabels, evidenceText } from "@/lib/telegram/labels";
import { replyStats, summarizeDeals } from "@/lib/telegram/stats";
import type { TgMessage } from "@/lib/telegram/types";

/** ሪፖርቶቹ በነባሪ በአማርኛ ይላካሉ፤ TELEGRAM_REPORT_LOCALE=en ከሆነ በእንግሊዝኛ። */
function reportLocale(): Locale {
  return process.env.TELEGRAM_REPORT_LOCALE === "en" ? "en" : "am";
}

function adminUrl(locale: Locale, path: string): string | null {
  const base = (process.env.SITE_URL ?? process.env.BETTER_AUTH_URL ?? "").replace(/\/$/, "");
  return base.startsWith("https://") ? `${base}${localePath(locale, path)}` : null;
}

function link(url: string | null, label: string): string {
  return url ? `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>` : "";
}

export async function buildDailyReport(t: T, locale: Locale, now = new Date()): Promise<string> {
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const [connections, messages, newChats, waiting, alerts, deals] = await Promise.all([
    db.telegramConnection.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, ownerName: true, ownerUsername: true, isEnabled: true } }),
    db.telegramMessage.findMany({
      where: { sentAt: { gte: since } },
      orderBy: { sentAt: "asc" },
      select: { chatId: true, direction: true, sentAt: true, chat: { select: { connectionId: true } } },
    }),
    db.telegramChat.groupBy({ by: ["connectionId"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
    db.telegramChat.groupBy({ by: ["connectionId"], where: { lastDirection: "IN" }, _count: { _all: true } }),
    db.telegramAlert.findMany({
      where: { createdAt: { gte: since } },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      select: { type: true, evidence: true, severity: true, chat: { select: { name: true, connectionId: true } } },
    }),
    db.telegramDeal.findMany({
      where: { dealAt: { gte: since } },
      select: { kind: true, status: true, amountEtb: true, paidToCompany: true, chat: { select: { connectionId: true } } },
    }),
  ]);

  const lines = [`<b>${escapeHtml(t("Telegram daily report"))}</b>`, escapeHtml(t("Last 24 hours"))];
  if (connections.length === 0) lines.push("", escapeHtml(t("No Telegram account is connected yet.")));

  for (const connection of connections) {
    const own = messages.filter((message) => message.chat.connectionId === connection.id);
    const stats = replyStats(own);
    const count = (groups: { connectionId: string; _count: { _all: number } }[]) =>
      groups.find((group) => group.connectionId === connection.id)?._count._all ?? 0;
    const title = connection.ownerUsername ? `${connection.ownerName} (@${connection.ownerUsername})` : connection.ownerName;
    lines.push(
      "",
      `<b>${escapeHtml(title)}</b>${connection.isEnabled ? "" : ` · ${escapeHtml(t("Paused"))}`}`,
      escapeHtml(t("Active chats: {count}", { count: new Set(own.map((message) => message.chatId)).size })),
      escapeHtml(t("New chats: {count}", { count: count(newChats) })),
      escapeHtml(t("Customer messages: {count}", { count: own.filter((message) => message.direction === "IN").length })),
      escapeHtml(t("Staff replies: {count}", { count: own.filter((message) => message.direction === "OUT").length })),
      escapeHtml(
        stats.averageMinutes === null ? t("Average reply time: no replies yet") : t("Average reply time: {minutes} min", { minutes: stats.averageMinutes })
      ),
      escapeHtml(t("Replies slower than 1 hour: {count}", { count: stats.slowReplies })),
      escapeHtml(t("Waiting for a reply now: {count}", { count: count(waiting) })),
      escapeHtml(t("New alerts: {count}", { count: alerts.filter((alert) => alert.chat.connectionId === connection.id).length }))
    );
    const sales = summarizeDeals(deals.filter((deal) => deal.chat.connectionId === connection.id));
    if (sales.any) {
      lines.push(
        escapeHtml(t("Sales: {count} · paid {amount} ETB", { count: sales.sales, amount: sales.paidEtb.toLocaleString("en-US") })),
        escapeHtml(t("Course registrations: {count}", { count: sales.registrations }))
      );
      if (sales.unverified > 0) lines.push(escapeHtml(t("Payments not yet verified: {count}", { count: sales.unverified })));
    }
  }

  if (alerts.length > 0) {
    lines.push("", `<b>${escapeHtml(t("Alerts"))}</b>`);
    for (const alert of alerts.slice(0, 8)) {
      const marker = alert.severity === "HIGH" ? "🔴" : alert.severity === "MEDIUM" ? "🟠" : "⚪";
      lines.push(`${marker} ${escapeHtml(t(alertLabels[alert.type]))}: <code>${escapeHtml(evidenceText(t, alert.type, alert.evidence))}</code> · ${escapeHtml(alert.chat.name)}`);
    }
    if (alerts.length > 8) lines.push(escapeHtml(t("…and {count} more", { count: alerts.length - 8 })));
  }

  const dashboard = link(adminUrl(locale, "/admin/telegram"), t("Open the dashboard"));
  if (dashboard) lines.push("", dashboard);
  return lines.join("\n");
}

export async function sendDailyReport(): Promise<number> {
  const locale = reportLocale();
  return notifyOwners(await buildDailyReport(createT(locale), locale));
}

/** ከፍተኛ ማስጠንቀቂያ ሲነሳ ለባለቤቶቹ ወዲያውኑ ይላካል። */
export async function sendAlertNotifications(alerts: NewAlert[]) {
  const locale = reportLocale();
  const t = createT(locale);
  for (const alert of alerts) {
    const lines = [
      `⚠️ <b>${escapeHtml(t(alertLabels[alert.type]))}</b>`,
      escapeHtml(t("Chat with {name}", { name: alert.chatName })) + ` · ${escapeHtml(alert.accountName)}`,
      `<code>${escapeHtml(evidenceText(t, alert.type, alert.evidence))}</code>`,
    ];
    if (alert.excerpt) lines.push(`<blockquote>${escapeHtml(alert.excerpt)}</blockquote>`);
    // ሊንኩ በቀጥታ ወደ ጉዳዩ መልዕክት ይሄዳል (የተሰረዘም ቢሆን ቅጂው ይታያል)።
    const anchor = alert.messageRowId ? `#m-${alert.messageRowId}` : "";
    const chatLink = link(adminUrl(locale, `/admin/telegram/${alert.chatRowId}${anchor}`), t("Open the message"));
    if (chatLink) lines.push(chatLink);
    await notifyOwners(lines.join("\n"));
  }
}

/** ከቦቱ ጋር በቀጥታ የሚደረግ ቻት፦ /start የራስን chat ID ይነግራል፣ /report ለባለቤቶች ሪፖርቱን አሁኑኑ ይልካል። */
export async function handleBotChat(message: TgMessage) {
  if (message.chat.type !== "private") return;
  const text = message.text?.trim() ?? "";
  const locale = reportLocale();
  const t = createT(locale);
  if (/^\/(start|id)\b/.test(text)) {
    await sendMessage(message.chat.id, escapeHtml(t("Your chat ID is {id}. Add it to TELEGRAM_OWNER_CHAT_IDS to receive reports and alerts.", { id: message.chat.id })));
  } else if (/^\/report\b/.test(text) && ownerChatIds().includes(String(message.chat.id))) {
    await sendMessage(message.chat.id, await buildDailyReport(t, locale));
  }
}
