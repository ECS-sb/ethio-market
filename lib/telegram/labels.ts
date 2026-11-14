import type { MessageKey } from "@/lib/messages";
import type { AlertSeverity, AlertType } from "@/lib/telegram/detect";
import type { DealLike } from "@/lib/telegram/stats";

export const alertLabels: Record<AlertType, MessageKey> = {
  PHONE_NUMBER: "Phone number shared",
  TELEGRAM_CONTACT: "Telegram contact shared",
  WHATSAPP: "WhatsApp contact shared",
  BANK_ACCOUNT: "Bank account number shared",
  SUSPICIOUS_PHRASE: "Suspicious phrase",
  DELETED_MESSAGE: "Messages deleted",
  PAYMENT_TO_OTHER_ACCOUNT: "Payment to a non-company account",
  DUPLICATE_RECEIPT: "Receipt used twice",
  AI_SUSPICION: "AI: possible side deal",
};

export const dealKindLabels: Record<DealLike["kind"], MessageKey> = {
  SALE: "Sale",
  REGISTRATION: "Registration",
};

export const dealStatusLabels: Record<DealLike["status"], MessageKey> = {
  NEGOTIATING: "Negotiating",
  AGREED: "Agreed",
  PAID: "Paid",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

/** ክፍያው ወደ የት እንደገባ፦ true ድርጅቱ፣ false ሌላ ሂሳብ፣ null አልተረጋገጠም። */
export function paymentLabel(paidToCompany: boolean | null): MessageKey {
  return paidToCompany === true ? "Company account" : paidToCompany === false ? "Other account" : "Not verified";
}

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
