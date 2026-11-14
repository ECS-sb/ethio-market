import { SearchIcon, TriangleAlertIcon } from "lucide-react";
import { LocaleLink } from "@/components/i18n-provider";
import { ChatAvatar } from "@/components/telegram/chat-avatar";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/catalog";
import { localePath, type T } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/i18n-server";
import { inboxQuery, type Folder, type InboxParams } from "@/lib/telegram/folders";
import { chatListTime, isRecentlyActive } from "@/lib/telegram/format";
import type { Inbox as InboxData } from "@/lib/telegram/inbox";
import { alertLabels, dealStatusLabels, evidenceText, mediaLabels } from "@/lib/telegram/labels";
import { cn } from "@/lib/utils";

type Chat = InboxData["chats"][number];

/** በፎልደሩ የሚስማማ አጭር መስመር፦ ማስጠንቀቂያ፣ ስምምነት፣ ወይም የመጨረሻው መልዕክት። */
function preview(t: T, chat: Chat, folder: Folder): { text: string; tone: "alert" | "deal" | "plain" } {
  const alert = chat.alerts[0];
  if (folder === "alerts" && alert) {
    return { text: `${t(alertLabels[alert.type])}: ${evidenceText(t, alert.type, alert.evidence)}`, tone: "alert" };
  }
  const deal = chat.deals[0];
  if (deal && (folder === "progress" || folder === "paid" || folder === "sales" || folder === "registrations")) {
    const parts = [deal.item, deal.amountEtb === null ? null : formatPrice(t, deal.amountEtb), t(dealStatusLabels[deal.status])];
    return { text: parts.filter(Boolean).join(" · "), tone: "deal" };
  }
  const last = chat.messages[0];
  if (!last) return { text: "", tone: "plain" };
  const body = last.text || (last.mediaType ? `[${t(mediaLabels[last.mediaType] ?? "Media")}]` : "");
  const prefix = last.direction === "OUT" ? `${t("Staff")}: ` : "";
  return { text: `${last.deletedAt ? `(${t("Deleted")}) ` : ""}${prefix}${body}`, tone: "plain" };
}

export async function Inbox({
  inbox,
  params,
  basePath,
  selectedId,
  now,
}: {
  inbox: InboxData;
  params: InboxParams;
  basePath: string;
  selectedId: string | null;
  now: Date;
}) {
  const t = await getT();
  const locale = await getLocale();
  const chatQuery = inboxQuery(params);

  return (
    <aside className="flex min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 lg:h-[calc(100dvh-var(--tg-offset,18rem))] lg:min-h-[24rem]">
      <div className="flex flex-col gap-2 border-b border-border p-3">
        {inbox.connections.length > 1 ? (
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {[{ id: "", ownerName: t("All accounts") }, ...inbox.connections].map((connection) => (
              <LocaleLink
                key={connection.id || "all"}
                href={`${basePath}${inboxQuery({ ...params, account: connection.id })}`}
                aria-current={params.account === connection.id ? "true" : undefined}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-1.5 text-xs ring-1 transition-colors",
                  params.account === connection.id ? "bg-foreground text-background ring-foreground" : "text-muted-foreground ring-foreground/15 hover:text-foreground"
                )}
              >
                {connection.ownerName}
              </LocaleLink>
            ))}
          </div>
        ) : null}
        <form action={localePath(locale, basePath)} className="relative" role="search">
          <SearchIcon className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={params.q}
            placeholder={t("Search chats")}
            aria-label={t("Search chats")}
            className="h-10 border-transparent bg-muted ps-10 dark:bg-muted"
            autoComplete="off"
          />
          {params.folder !== "all" ? <input type="hidden" name="folder" value={params.folder} /> : null}
          {params.account ? <input type="hidden" name="account" value={params.account} /> : null}
        </form>
      </div>

      {inbox.chats.length === 0 ? (
        <p className="m-auto p-6 text-center text-sm text-muted-foreground">{params.q ? t("No chats match your search.") : t("No chats in this folder.")}</p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          {inbox.chats.map((chat) => {
            const line = preview(t, chat, params.folder);
            const selected = chat.id === selectedId;
            // በማስጠንቀቂያ ፎልደር ውስጥ ሲነካ በቀጥታ ወደ ጉዳዩ መልዕክት (የተሰረዘም ቢሆን) ይሄዳል።
            const alertMessage = params.folder === "alerts" ? chat.alerts[0]?.messageId : null;
            return (
              <li key={chat.id}>
                <LocaleLink
                  href={`/admin/telegram/${chat.id}${chatQuery}${alertMessage ? `#m-${alertMessage}` : ""}`}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3 transition-colors",
                    selected ? "bg-[var(--tg-row-active,var(--muted))] text-white" : "hover:bg-accent"
                  )}
                >
                  <ChatAvatar name={chat.name} active={isRecentlyActive(chat.lastInboundAt, now)} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold">{chat.name}</span>
                      <span className={cn("shrink-0 text-xs", selected ? "text-white/70" : "text-muted-foreground")}>{chatListTime(chat.lastMessageAt, now)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          selected
                            ? "text-white/75"
                            : line.tone === "alert"
                              ? "text-destructive"
                              : line.tone === "deal"
                                ? "text-[var(--tg-link,var(--foreground))]"
                                : "text-muted-foreground"
                        )}
                      >
                        {line.text}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        {chat._count.alerts > 0 ? (
                          <span
                            title={t("{count} alerts", { count: chat._count.alerts })}
                            className="flex h-5 items-center gap-0.5 rounded-full bg-destructive/15 px-1.5 text-[11px] font-semibold text-destructive"
                          >
                            <TriangleAlertIcon className="size-3" />
                            {chat._count.alerts}
                          </span>
                        ) : null}
                        {chat.waitingCount > 0 ? (
                          <span
                            title={t("Waiting for a reply")}
                            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground"
                          >
                            {chat.waitingCount}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    {inbox.connections.length > 1 && !params.account ? (
                      <span className="truncate text-[11px] text-muted-foreground">{chat.connection.ownerName}</span>
                    ) : null}
                  </div>
                </LocaleLink>
              </li>
            );
          })}
          {inbox.truncated ? <li className="p-3 text-center text-xs text-muted-foreground">{t("Showing the latest {count} chats.", { count: inbox.chats.length })}</li> : null}
        </ul>
      )}
    </aside>
  );
}
