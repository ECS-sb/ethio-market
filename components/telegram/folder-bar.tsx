import {
  BadgeDollarSignIcon,
  BanknoteIcon,
  CircleCheckIcon,
  ClockIcon,
  GraduationCapIcon,
  HandshakeIcon,
  MessagesSquareIcon,
  ReceiptIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import { LocaleLink } from "@/components/i18n-provider";
import { getT } from "@/lib/i18n-server";
import { FOLDERS, folderLabels, inboxQuery, type Folder, type InboxParams } from "@/lib/telegram/folders";
import type { Inbox } from "@/lib/telegram/inbox";
import { cn } from "@/lib/utils";

const folderIcons: Record<Folder, LucideIcon> = {
  all: MessagesSquareIcon,
  waiting: ClockIcon,
  alerts: TriangleAlertIcon,
  progress: HandshakeIcon,
  paid: CircleCheckIcon,
  sales: BadgeDollarSignIcon,
  registrations: GraduationCapIcon,
  withdrawals: BanknoteIcon,
  receipts: ReceiptIcon,
};

/**
 * ከቁጥሮቹ ስር ያለው የፎልደሮች መስመር፤ ሁልጊዜ በአንድ መስመር ነው። ትንሽ ጽሑፍ ነው፤ አዶዎቹ በሰፊ ስክሪን ብቻ ይታያሉ።
 * ቦታው ካልበቃ (ለምሳሌ በስልክ) ወደ ጎን ይንሸራተታል።
 */
export async function FolderBar({ inbox, params, basePath }: { inbox: Inbox; params: InboxParams; basePath: string }) {
  const t = await getT();
  return (
    <nav aria-label={t("Folders")} className="flex min-w-0 flex-nowrap gap-1 overflow-x-auto [scrollbar-width:none]">
      {FOLDERS.map((folder) => {
        const Icon = folderIcons[folder];
        const active = params.folder === folder;
        return (
          <LocaleLink
            key={folder}
            href={`${basePath}${inboxQuery({ ...params, folder })}`}
            aria-current={active ? "page" : undefined}
            title={t(folderLabels[folder])}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] leading-none font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-foreground/10 hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="hidden size-3 2xl:block" />
            {t(folderLabels[folder])}
            <span className={cn("rounded-full px-1 py-0.5 text-[10px]", active ? "bg-primary-foreground/15" : "bg-muted")}>{inbox.counts[folder]}</span>
          </LocaleLink>
        );
      })}
    </nav>
  );
}
