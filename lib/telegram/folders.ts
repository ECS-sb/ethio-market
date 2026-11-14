// እንደ ቴሌግራም ፎልደሮች፦ ቻቶቹ በምድብ ይከፈላሉ። ምንም database አይጠቀምም።
import type { MessageKey } from "@/lib/messages";

export const FOLDERS = ["all", "waiting", "alerts", "progress", "paid", "sales", "registrations", "receipts"] as const;
export type Folder = (typeof FOLDERS)[number];

/** ሁሉም ፎልደሮች በአንድ መስመር እንዲገቡ አጫጭር ስሞች። */
export const folderLabels: Record<Folder, MessageKey> = {
  all: "All",
  waiting: "Unanswered",
  alerts: "Flagged",
  progress: "In progress",
  paid: "Paid",
  sales: "Sales",
  registrations: "Registrations",
  receipts: "Receipts",
};

export type InboxParams = { folder: Folder; q: string; account: string };

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseInboxParams(params: SearchParams): InboxParams {
  const folder = first(params.folder);
  return {
    folder: (FOLDERS as readonly string[]).includes(folder) ? (folder as Folder) : "all",
    q: first(params.q).trim().slice(0, 100),
    account: first(params.account).slice(0, 100),
  };
}

/** ነባሪ ያልሆኑትን ብቻ የያዘ "?folder=…&q=…" (ምንም ከሌለ ባዶ)። */
export function inboxQuery(params: Partial<InboxParams>): string {
  const query = new URLSearchParams();
  if (params.folder && params.folder !== "all") query.set("folder", params.folder);
  if (params.account) query.set("account", params.account);
  if (params.q) query.set("q", params.q);
  const text = query.toString();
  return text ? `?${text}` : "";
}
