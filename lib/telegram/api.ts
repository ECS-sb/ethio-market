import "server-only";
import type { TgBusinessConnection, TgMessage } from "@/lib/telegram/types";

const API_BASE = "https://api.telegram.org";

export class TelegramApiError extends Error {}

/** የቦቱ token ከenv ብቻ ይነበባል፤ በlog ወይም በስህተት መልዕክት ውስጥ አይወጣም። */
async function callTelegram<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new TelegramApiError("TELEGRAM_BOT_TOKEN is not set");
  const response = await fetch(`${API_BASE}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as { ok?: boolean; result?: T; description?: string } | null;
  if (!data?.ok) throw new TelegramApiError(`${method} failed: ${data?.description ?? response.status}`);
  return data.result as T;
}

export function getBusinessConnection(businessConnectionId: string) {
  return callTelegram<TgBusinessConnection>("getBusinessConnection", { business_connection_id: businessConnectionId });
}

/** ጽሑፉ HTML parse_mode ነው፤ የተጠቃሚ ጽሑፍ ከመግባቱ በፊት በescapeHtml መታለፍ አለበት። */
export function sendMessage(chatId: string | number, html: string) {
  return callTelegram<TgMessage>("sendMessage", {
    chat_id: chatId,
    text: html.slice(0, 4096),
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  });
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** ሪፖርትና ማስጠንቀቂያ የሚደርሳቸው የባለቤቶች chat ID (በኮማ የተለዩ)። */
export function ownerChatIds(): string[] {
  return (process.env.TELEGRAM_OWNER_CHAT_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => /^-?\d+$/.test(value));
}

export async function notifyOwners(html: string): Promise<number> {
  let sent = 0;
  for (const chatId of ownerChatIds()) {
    try {
      await sendMessage(chatId, html);
      sent += 1;
    } catch (error) {
      console.error("telegram: could not notify owner", error);
    }
  }
  return sent;
}
