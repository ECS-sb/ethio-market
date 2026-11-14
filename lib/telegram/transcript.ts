// የቻቱን መልዕክቶች Claude እንዲያነባቸው ወደ ቁጥር የተሰጣቸው መስመሮች ይቀይራል። ምንም database አይጠቀምም።

export type TranscriptReceipt = {
  isReceipt: boolean;
  provider: string | null;
  amountEtb: number | null;
  recipientName: string | null;
  recipientAccount: string | null;
  transactionId: string | null;
  toCompany: boolean | null;
};

export type TranscriptMessage = {
  direction: "IN" | "OUT";
  viaBot: boolean;
  text: string;
  mediaType: string | null;
  sentAt: Date;
  deletedAt: Date | null;
  previousText: string | null;
  receipt: TranscriptReceipt | null;
};

/** በጣም ረጅም መልዕክት (ለምሳሌ የተለጠፈ ጽሑፍ) ሙሉ ቻቱን እንዳይውጥ ይቆረጣል፤ መቆረጡም በግልጽ ይታያል። */
const MAX_MESSAGE_CHARS = 2000;

function clip(text: string): string {
  return text.length > MAX_MESSAGE_CHARS ? `${text.slice(0, MAX_MESSAGE_CHARS)} […message cut]` : text;
}

const addisFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Addis_Ababa",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function addisTime(date: Date): string {
  return addisFormat.format(date).replace(",", "");
}

function describeReceipt(receipt: TranscriptReceipt): string {
  if (!receipt.isReceipt) return "(checked: not a payment receipt)";
  const destination =
    receipt.toCompany === true ? "TO A COMPANY ACCOUNT" : receipt.toCompany === false ? "TO A NON-COMPANY ACCOUNT" : "recipient not verified";
  const recipient = [receipt.recipientName, receipt.recipientAccount].filter(Boolean).join(" ") || "unknown recipient";
  return `(payment receipt: ${receipt.provider ?? "unknown provider"}, ${receipt.amountEtb ?? "?"} ETB to ${recipient}, transaction ${receipt.transactionId ?? "?"}, ${destination})`;
}

export function buildTranscript(messages: TranscriptMessage[]): string {
  return messages
    .map((message, index) => {
      const who = message.direction === "IN" ? "CUSTOMER" : message.viaBot ? "BOT" : "STAFF";
      const parts: string[] = [];
      if (message.mediaType) parts.push(`[${message.mediaType}]`);
      if (message.receipt) parts.push(describeReceipt(message.receipt));
      if (message.text) parts.push(clip(message.text));
      let line = `#${index + 1} [${addisTime(message.sentAt)}] ${who}: ${parts.join(" ")}`;
      if (message.previousText !== null) line += `\n    (edited; before the edit it said: ${clip(message.previousText)})`;
      if (message.deletedAt) line += "\n    (this message was deleted later)";
      return line;
    })
    .join("\n");
}
