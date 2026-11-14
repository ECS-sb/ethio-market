import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/auto-refresh";
import { ChatView } from "@/components/telegram/chat-view";
import { FolderBar } from "@/components/telegram/folder-bar";
import { Inbox } from "@/components/telegram/inbox";
import { TelegramHeader } from "@/components/telegram/telegram-header";
import { pageTitle } from "@/lib/i18n-server";
import { requireAdmin } from "@/lib/session";
import { inboxQuery, parseInboxParams } from "@/lib/telegram/folders";
import { getInbox } from "@/lib/telegram/inbox";
import { getTelegramChat } from "@/lib/telegram/queries";

export const generateMetadata = pageTitle("Telegram chat");

/** "ይህንን ቻት ተንትን" አዝራሩ Claude እስኪጨርስ ይጠብቃል። */
export const maxDuration = 300;

export default async function AdminTelegramChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { id } = await params;
  const inboxParams = parseInboxParams(await searchParams);
  const now = new Date();
  const [chat, inbox] = await Promise.all([getTelegramChat(id), getInbox(inboxParams)]);
  if (!chat) notFound();

  return (
    <>
      <AutoRefresh intervalMs={20000} />
      {/* በስልክ ላይ ቻቱ ብቻ ይታያል፤ ዝርዝሩ በ"ተመለስ" ቀስት ይመጣል። */}
      <div className="hidden flex-col gap-4 lg:flex">
        <TelegramHeader inbox={inbox} />
        <FolderBar inbox={inbox} params={inboxParams} basePath={`/admin/telegram/${id}`} />
      </div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="hidden min-w-0 lg:block">
          <Inbox inbox={inbox} params={inboxParams} basePath={`/admin/telegram/${id}`} selectedId={id} now={now} />
        </div>
        <ChatView chat={chat} backHref={`/admin/telegram${inboxQuery(inboxParams)}`} now={now} />
      </div>
    </>
  );
}
