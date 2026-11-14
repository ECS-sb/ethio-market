import { timingSafeEqual } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { handleBusinessUpdate } from "@/lib/telegram/ingest";
import { handleBotChat, sendAlertNotifications } from "@/lib/telegram/report";
import type { TgUpdate } from "@/lib/telegram/types";

function sameSecret(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Telegram ቦቱ የሚደርሰውን እያንዳንዱን update ወደዚህ ይልካል (setWebhook ላይ secret_token ተሰጥቶታል)። */
export async function POST(request: NextRequest) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const given = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (!expected || !sameSecret(given, expected)) return new Response(null, { status: 401 });

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return new Response(null, { status: 400 });
  }

  try {
    const alerts = await handleBusinessUpdate(update);
    if (alerts.length > 0) after(() => sendAlertNotifications(alerts));
    if (update.message) {
      const message = update.message;
      after(() => handleBotChat(message));
    }
  } catch (error) {
    // 200 ይመለሳል፤ አለበለዚያ Telegram ይህንኑ update ደጋግሞ እየሞከረ ቀጣዮቹ ይዘገያሉ።
    console.error("telegram webhook: update", update.update_id, "failed", error);
  }
  return Response.json({ ok: true });
}
