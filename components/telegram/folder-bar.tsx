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

/** ከቁጥሮቹ ስር ሙሉውን ስፋት የሚይዝ የፎልደሮች መስመር፤ በስልክ ወደ ጎን ይንሸራተታል፣ በጠባብ ኮምፒውተር ስክሪን ወደ ቀጣይ መስመር ይወርዳል። */
export async function FolderBar({ inbox, params, basePath }: { inbox: Inbox; params: InboxParams; basePath: string }) {
  const t = await getT();
  return (
    <nav aria-label={t("Folders")} className="flex min-w-0 gap-1.5 overflow-x-auto [scrollbar-width:none] lg:flex-wrap">
      {FOLDERS.map((folder) => {
        const Icon = folderIcons[folder];
        const active = params.folder === folder;
        return (
          <LocaleLink
            key={folder}
            href={`${basePath}${inboxQuery({ ...params, folder })}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "bg-card/70 text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {t(folderLabels[folder])}
            <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-primary-foreground/15" : "bg-muted")}>{inbox.counts[folder]}</span>
          </LocaleLink>
        );
      })}
    </nav>
  );
}
