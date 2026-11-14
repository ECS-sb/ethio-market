export type DirectedMessage = { chatId: string; direction: "IN" | "OUT"; sentAt: Date };

const HOUR = 60 * 60 * 1000;

/**
 * ደንበኛው ከጻፈበት የመጀመሪያው መልዕክት እስከ ሰራተኛው የመጀመሪያ ምላሽ ያለውን ጊዜ ይለካል።
 * messages በsentAt ቅደም ተከተል መሆን አለባቸው።
 */
export function replyStats(messages: DirectedMessage[]) {
  const waitingSince = new Map<string, number>();
  const durations: number[] = [];
  for (const message of messages) {
    const time = message.sentAt.getTime();
    if (message.direction === "IN") {
      if (!waitingSince.has(message.chatId)) waitingSince.set(message.chatId, time);
    } else {
      const start = waitingSince.get(message.chatId);
      if (start !== undefined) {
        durations.push(time - start);
        waitingSince.delete(message.chatId);
      }
    }
  }
  const total = durations.reduce((sum, value) => sum + value, 0);
  return {
    replies: durations.length,
    averageMinutes: durations.length ? Math.max(1, Math.round(total / durations.length / 60000)) : null,
    slowReplies: durations.filter((value) => value > HOUR).length,
  };
}

export type DealLike = {
  kind: "SALE" | "REGISTRATION";
  status: "NEGOTIATING" | "AGREED" | "PAID" | "DELIVERED" | "CANCELLED";
  amountEtb: number | null;
  paidToCompany: boolean | null;
};

const CLOSED_STATUSES = new Set(["AGREED", "PAID", "DELIVERED"]);
const PAID_STATUSES = new Set(["PAID", "DELIVERED"]);

/** የተዘጉ ሽያጮች፣ ምዝገባዎች፣ ወደ ድርጅቱ (ወይም ገና ያልተረጋገጠ) የተከፈለ ብር። ወደ ሌላ ሂሳብ የተከፈለው አይደመርም። */
export function summarizeDeals(deals: DealLike[]) {
  const paid = deals.filter((deal) => PAID_STATUSES.has(deal.status));
  return {
    any: deals.length > 0,
    sales: deals.filter((deal) => deal.kind === "SALE" && CLOSED_STATUSES.has(deal.status)).length,
    registrations: deals.filter((deal) => deal.kind === "REGISTRATION" && CLOSED_STATUSES.has(deal.status)).length,
    paidEtb: paid.filter((deal) => deal.paidToCompany !== false).reduce((sum, deal) => sum + (deal.amountEtb ?? 0), 0),
    unverified: paid.filter((deal) => deal.paidToCompany === null).length,
    otherAccount: deals.filter((deal) => deal.paidToCompany === false).length,
  };
}

/** የአዲስ አበባ ሰዓት (UTC+3፣ የክረምት/የበጋ ለውጥ የለውም) የዛሬ መጀመሪያ። */
export function startOfTodayInAddis(now = new Date()): Date {
  const offset = 3 * HOUR;
  const local = new Date(now.getTime() + offset);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - offset);
}
