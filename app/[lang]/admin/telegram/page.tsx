import { cookies } from "next/headers";
import { MessagesSquareIcon } from "lucide-react";
import { AutoRefresh } from "@/components/auto-refresh";
import { FolderBar } from "@/components/telegram/folder-bar";
import { Inbox } from "@/components/telegram/inbox";
import { TelegramHeader } from "@/components/telegram/telegram-header";
import { TelegramWorkspace } from "@/components/telegram/workspace";
import { getT, pageTitle } from "@/lib/i18n-server";
import { requireAdmin } from "@/lib/session";
import { parseInboxParams } from "@/lib/telegram/folders";
import { getInbox } from "@/lib/telegram/inbox";
import { readLayoutPrefs } from "@/lib/telegram/layout-prefs";

export const generateMetadata = pageTitle("Telegram monitoring");

export default async function AdminTelegramPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const t = await getT();
  await requireAdmin();
  const params = parseInboxParams(await searchParams);
  const store = await cookies();
  const prefs = readLayoutPrefs((name) => store.get(name)?.value);
  const now = new Date();
  const inbox = await getInbox(params);

  return (
    <>
      <AutoRefresh intervalMs={30000} />
      <TelegramWorkspace
        mode="list"
        initialStatsOpen={prefs.statsOpen}
        initialListWidth={prefs.listWidth}
        stats={<TelegramHeader inbox={inbox} />}
        folders={<FolderBar inbox={inbox} params={params} basePath="/admin/telegram" />}
        list={<Inbox inbox={inbox} params={params} basePath="/admin/telegram" selectedId={null} now={now} />}
        main={
          <div className="hidden min-h-[24rem] flex-col items-center justify-center gap-4 rounded-xl bg-background text-sm text-muted-foreground ring-1 ring-foreground/10 lg:flex lg:h-[calc(100dvh-var(--tg-offset,18rem))]">
            <MessagesSquareIcon className="size-10 text-primary/60" />
            {t("Select a chat to read it.")}
          </div>
        }
      />
    </>
  );
}
