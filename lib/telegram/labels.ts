import type { MessageKey } from "@/lib/messages";
import type { AlertSeverity, AlertType } from "@/lib/telegram/detect";

export const alertLabels: Record<AlertType, MessageKey> = {
  PHONE_NUMBER: "Phone number shared",
  TELEGRAM_CONTACT: "Telegram contact shared",
  WHATSAPP: "WhatsApp contact shared",
  BANK_ACCOUNT: "Bank account number shared",
  SUSPICIOUS_PHRASE: "Suspicious phrase",
  DELETED_MESSAGE: "Messages deleted",
};

export const severityLabels: Record<AlertSeverity, MessageKey> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const mediaLabels: Record<string, MessageKey> = {
  photo: "Photo",
  document: "File",
  video: "Video",
  video_note: "Video",
  voice: "Voice message",
  audio: "Audio",
  sticker: "Sticker",
  contact: "Contact",
  location: "Location",
};

/** ለDELETED_MESSAGE ማስረጃው የተሰረዙት መልዕክቶች ብዛት ነው። */
export function evidenceText(t: (key: MessageKey, vars?: Record<string, string | number>) => string, type: AlertType, evidence: string): string {
  return type === "DELETED_MESSAGE" ? t("{count} deleted", { count: evidence }) : evidence;
}
