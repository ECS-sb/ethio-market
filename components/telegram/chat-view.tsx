import { ArrowLeftIcon, ChevronDownIcon, ExternalLinkIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react";
import { ActionButton } from "@/components/action-form";
import { LocaleLink } from "@/components/i18n-provider";
import { ChatAvatar } from "@/components/telegram/chat-avatar";
import { Badge } from "@/components/ui/badge";
import { analyzeTelegramChatAction, resolveTelegramAlertAction } from "@/lib/actions";
import { formatDateTime, formatPrice } from "@/lib/catalog";
import type { T } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { dayKey, dayLabel, messageTime } from "@/lib/telegram/format";
import { alertLabels, dealKindLabels, dealStatusLabels, evidenceText, mediaLabels, paymentLabel, severityLabels } from "@/lib/telegram/labels";
import type { getTelegramChat } from "@/lib/telegram/queries";
import { TELEGRAM_CHAT_PAGE } from "@/lib/telegram/queries";
import { cn } from "@/lib/utils";

type ChatData = NonNullable<Awaited<ReturnType<typeof getTelegramChat>>>;
type Message = ChatData["messages"][number];

const severityVariant = { HIGH: "destructive", MEDIUM: "default", LOW: "outline" } as const;

function paymentVariant(paidToCompany: boolean | null) {
  return paidToCompany === false ? "destructive" : paidToCompany ? "default" : "outline";
}

function receiptLine(t: T, receipt: NonNullable<Message["receipt"]>): string {
  if (!receipt.isReceipt) return t("Not a payment receipt");
  const recipient = [receipt.recipientName, receipt.recipientAccount].filter(Boolean).join(" ");
  const parts = [receipt.provider, receipt.amountEtb === null ? null : formatPrice(t, Math.round(receipt.amountEtb)), recipient ? `→ ${recipient}` : null, receipt.transactionId];
  return `${t("Receipt")}: ${parts.filter(Boolean).join(" · ")}`;
}

function MessageBubble({ t, message }: { t: T; message: Message }) {
  const outgoing = message.direction === "OUT";
  const media = message.mediaType ? t(mediaLabels[message.mediaType] ?? "Media") : null;
  return (
    <div className={cn("flex flex-col gap-1", outgoing ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm break-words whitespace-pre-line sm:max-w-[75%]",
          outgoing ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
          message.flagged && "ring-2 ring-destructive",
          message.deletedAt && "opacity-60"
        )}
      >
        {media ? <span className="block text-xs font-semibold">[{media}]</span> : null}
        {message.text}
        <span className="mt-1 flex items-center justify-end gap-2 text-[11px] opacity-70">
          {message.viaBot ? <span>{t("Sent by bot")}</span> : null}
          {message.editedAt ? <span>{t("Edited")}</span> : null}
          {message.deletedAt ? <span className="font-semibold">{t("Deleted")}</span> : null}
          <time dateTime={message.sentAt.toISOString()}>{messageTime(message.sentAt)}</time>
        </span>
      </div>
      {message.receipt ? (
        <p
          className={cn(
            "flex max-w-[85%] flex-wrap items-center gap-2 text-xs break-words sm:max-w-[75%]",
            message.receipt.isReceipt && message.receipt.toCompany === false ? "text-destructive" : "text-muted-foreground"
          )}
        >
          <span dir="auto">{receiptLine(t, message.receipt)}</span>
          {message.receipt.isReceipt ? <Badge variant={paymentVariant(message.receipt.toCompany)}>{t(paymentLabel(message.receipt.toCompany))}</Badge> : null}
        </p>
      ) : null}
      {message.previousText !== null ? (
        <p className="max-w-[85%] text-xs break-words whitespace-pre-line text-muted-foreground sm:max-w-[75%]">
          {t("Before edit:")} {message.previousText}
        </p>
      ) : null}
    </div>
  );
}

export async function ChatView({ chat, backHref }: { chat: ChatData; backHref: string }) {
  const t = await getT();
  const openAlerts = chat.alerts.filter((alert) => !alert.resolved);

  // ቀን በቀን፦ የቀን መለያ፣ ከዚያ የዚያ ቀን መልዕክቶች።
  const items: ({ kind: "day"; key: string; date: Date } | { kind: "message"; message: Message })[] = [];
  let currentDay = "";
  for (const message of chat.messages) {
    const key = dayKey(message.sentAt);
    if (key !== currentDay) {
      items.push({ kind: "day", key, date: message.sentAt });
      currentDay = key;
    }
    items.push({ kind: "message", message });
  }

  return (
    <section
      aria-label={t("Chat with {name}", { name: chat.name })}
      className="flex h-[calc(100dvh-9rem)] min-h-[28rem] min-w-0 flex-col overflow-hidden rounded-xl bg-card/70 ring-1 ring-foreground/10 lg:h-[calc(100dvh-13rem)] lg:min-h-[32rem]"
    >
      <header className="flex items-center gap-3 border-b border-border p-4">
        <LocaleLink href={backHref} aria-label={t("Back to chats")} className="text-muted-foreground hover:text-foreground lg:hidden">
          <ArrowLeftIcon className="size-5" />
        </LocaleLink>
        <ChatAvatar name={chat.name} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate font-semibold">{chat.name}</h1>
          <span className="truncate text-xs text-muted-foreground">
            {chat.username ? <span dir="ltr">@{chat.username} · </span> : null}
            {chat.connection.ownerName}
          </span>
        </div>
        {chat.username ? (
          <a
            href={`https://t.me/${chat.username}`}
            target="_blank"
            rel="noreferrer"
            aria-label={t("Open in Telegram")}
            title={t("Open in Telegram")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLinkIcon className="size-5" />
          </a>
        ) : null}
      </header>

      {chat.aiEnabled || chat.aiSummary || openAlerts.length > 0 ? (
        <details open={openAlerts.length > 0} className="group border-b border-border">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
            <SparklesIcon className="size-4 text-primary" />
            <span className="font-medium">{t("AI summary")}</span>
            {chat.deals.length > 0 ? <Badge variant="secondary">{t("{count} deals", { count: chat.deals.length })}</Badge> : null}
            {openAlerts.length > 0 ? (
              <Badge variant="destructive">
                <TriangleAlertIcon />
                {openAlerts.length}
              </Badge>
            ) : null}
            <ChevronDownIcon className="ms-auto size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex max-h-72 flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm">
            {openAlerts.map((alert) => (
              <div key={alert.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-destructive/10 p-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge variant={severityVariant[alert.severity]}>{t(severityLabels[alert.severity])}</Badge>
                  <span className="font-semibold">{t(alertLabels[alert.type])}</span>
                  <code dir="auto" className="rounded-xl bg-muted px-2 py-0.5 text-xs break-all">
                    {evidenceText(t, alert.type, alert.evidence)}
                  </code>
                  <span className="text-xs text-muted-foreground">{formatDateTime(alert.createdAt)}</span>
                </div>
                <ActionButton action={resolveTelegramAlertAction} id={alert.id} variant="outline" size="sm">
                  {t("Mark resolved")}
                </ActionButton>
              </div>
            ))}
            {chat.aiSummary ? <p className="break-words whitespace-pre-line">{chat.aiSummary}</p> : null}
            {chat.deals.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {chat.deals.map((deal) => (
                  <li key={deal.id} className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{t(dealKindLabels[deal.kind])}</Badge>
                    <span className="font-medium break-words">{deal.item}</span>
                    {deal.amountEtb !== null ? <span>· {formatPrice(t, deal.amountEtb)}</span> : null}
                    <Badge variant="secondary">{t(dealStatusLabels[deal.status])}</Badge>
                    {deal.status === "PAID" || deal.status === "DELIVERED" ? (
                      <Badge variant={paymentVariant(deal.paidToCompany)}>{t(paymentLabel(deal.paidToCompany))}</Badge>
                    ) : null}
                    {deal.note ? <span className="text-muted-foreground">· {deal.note}</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {chat.analyzedAt ? (
                <span className="text-xs text-muted-foreground">{t("Analyzed {date}", { date: formatDateTime(chat.analyzedAt) })}</span>
              ) : (
                <span />
              )}
              {chat.aiEnabled ? (
                <ActionButton action={analyzeTelegramChatAction} id={chat.id} variant="outline" size="sm">
                  {t("Analyze this chat")}
                </ActionButton>
              ) : null}
            </div>
          </div>
        </details>
      ) : null}

      {/* flex-col-reverse፦ ገጹ ሲከፈት በቀጥታ የመጨረሻዎቹ መልዕክቶች ላይ ይቆማል። */}
      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto">
        <div className="flex flex-col gap-2 p-4">
          {chat.truncated ? (
            <p className="self-center text-xs text-muted-foreground">{t("Showing the latest {count} messages.", { count: TELEGRAM_CHAT_PAGE })}</p>
          ) : null}
          {items.map((item) =>
            item.kind === "day" ? (
              <p key={`day-${item.key}`} className="my-2 self-center rounded-xl bg-muted px-3 py-1 text-xs text-muted-foreground">
                {dayLabel(item.date)}
              </p>
            ) : (
              <MessageBubble key={item.message.id} t={t} message={item.message} />
            )
          )}
          {chat.messages.length === 0 ? <p className="m-auto text-sm text-muted-foreground">{t("No messages saved for this chat yet.")}</p> : null}
        </div>
      </div>
    </section>
  );
}
