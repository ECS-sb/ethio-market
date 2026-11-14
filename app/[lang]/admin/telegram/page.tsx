import { MessagesSquareIcon } from "lucide-react";
import { AutoRefresh } from "@/components/auto-refresh";
import { FolderBar } from "@/components/telegram/folder-bar";
import { Inbox } from "@/components/telegram/inbox";
import { TelegramHeader } from "@/components/telegram/telegram-header";
import { getT, pageTitle } from "@/lib/i18n-server";
import { requireAdmin } from "@/lib/session";
import { parseInboxParams } from "@/lib/telegram/folders";
import { getInbox } from "@/lib/telegram/inbox";

export const generateMetadata = pageTitle("Telegram monitoring");

export default async function AdminTelegramPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const t = await getT();
  await requireAdmin();
  const params = parseInboxParams(await searchParams);
  const now = new Date();
  const inbox = await getInbox(params);

  return (
    <>
      <AutoRefresh intervalMs={30000} />
      <div className="flex flex-col gap-4">
        <TelegramHeader inbox={inbox} />
        <FolderBar inbox={inbox} params={params} basePath="/admin/telegram" />
      </div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[22rem_1fr]">
        <Inbox inbox={inbox} params={params} basePath="/admin/telegram" selectedId={null} now={now} />
        <div className="hidden min-h-[24rem] flex-col items-center justify-center gap-4 rounded-xl bg-card/70 text-sm text-muted-foreground ring-1 ring-foreground/10 lg:flex lg:h-[calc(100dvh-18rem)]">
          <MessagesSquareIcon className="size-10 text-primary/60" />
          {t("Select a chat to read it.")}
        </div>
      </div>
    </>
  );
}
