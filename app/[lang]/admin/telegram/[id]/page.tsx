import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { ActionButton } from "@/components/action-form";
import { AutoRefresh } from "@/components/auto-refresh";
import { LocaleLink } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { resolveTelegramAlertAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { requireAdmin } from "@/lib/session";
import { alertLabels, evidenceText, mediaLabels, severityLabels } from "@/lib/telegram/labels";
import { getTelegramChat, TELEGRAM_CHAT_PAGE } from "@/lib/telegram/queries";
import { cn } from "@/lib/utils";

export const generateMetadata = pageTitle("Telegram chat");

const severityVariant = { HIGH: "destructive", MEDIUM: "default", LOW: "outline" } as const;

export default async function AdminTelegramChatPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  await requireAdmin();
  const { id } = await params;
  const chat = await getTelegramChat(id);
  if (!chat) notFound();
  const openAlerts = chat.alerts.filter((alert) => !alert.resolved);

  return (
    <>
      <AutoRefresh />
      <LocaleLink href="/admin/telegram" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        {t("Telegram monitoring")}
      </LocaleLink>

      {openAlerts.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {openAlerts.map((alert) => (
            <li key={alert.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card/70 p-6 text-sm ring-1 ring-destructive/40">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={severityVariant[alert.severity]}>{t(severityLabels[alert.severity])}</Badge>
                <span className="font-semibold">{t(alertLabels[alert.type])}</span>
                <code dir="ltr" className="rounded-xl bg-muted px-2 py-0.5 text-xs break-all">
                  {evidenceText(t, alert.type, alert.evidence)}
                </code>
                <span className="text-muted-foreground">{formatDateTime(alert.createdAt)}</span>
              </div>
              <ActionButton action={resolveTelegramAlertAction} id={alert.id} variant="outline">
                {t("Mark resolved")}
              </ActionButton>
            </li>
          ))}
        </ul>
      ) : null}

      <section
        aria-label={t("Chat with {name}", { name: chat.name })}
        className="flex min-w-0 flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10"
      >
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold">{chat.name}</h1>
            <span className="text-xs text-muted-foreground">
              {chat.username ? <span dir="ltr">@{chat.username} · </span> : null}
              {chat.connection.ownerName}
            </span>
          </div>
          {chat.username ? (
            <a
              href={`https://t.me/${chat.username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLinkIcon className="size-4" />
              {t("Open in Telegram")}
            </a>
          ) : null}
        </header>

        {chat.truncated ? <p className="text-xs text-muted-foreground">{t("Showing the latest {count} messages.", { count: TELEGRAM_CHAT_PAGE })}</p> : null}

        <div className="flex min-h-72 flex-col gap-4">
          {chat.messages.map((message) => {
            const outgoing = message.direction === "OUT";
            const media = message.mediaType ? t(mediaLabels[message.mediaType] ?? "Media") : null;
            return (
              <div key={message.id} className={cn("flex max-w-[80%] flex-col gap-1", outgoing ? "items-end self-end" : "items-start self-start")}>
                <div
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm break-words whitespace-pre-line",
                    outgoing ? "bg-primary text-primary-foreground" : "bg-secondary",
                    message.flagged && "ring-2 ring-destructive",
                    message.deletedAt && "opacity-60"
                  )}
                >
                  {media ? <span className="block text-xs font-semibold">[{media}]</span> : null}
                  {message.text}
                </div>
                {message.previousText !== null ? (
                  <p className="text-xs break-words whitespace-pre-line text-muted-foreground">
                    {t("Before edit:")} {message.previousText}
                  </p>
                ) : null}
                <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {outgoing ? (message.viaBot ? t("Sent by bot") : t("Staff")) : t("Customer")} · {formatDateTime(message.sentAt)}
                  {message.editedAt ? <Badge variant="outline">{t("Edited")}</Badge> : null}
                  {message.deletedAt ? <Badge variant="destructive">{t("Deleted")}</Badge> : null}
                </span>
              </div>
            );
          })}
          {chat.messages.length === 0 ? <p className="m-auto text-sm text-muted-foreground">{t("No messages saved for this chat yet.")}</p> : null}
        </div>
      </section>
    </>
  );
}
