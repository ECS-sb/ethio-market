import Image from "next/image";
import { ArrowLeftIcon, ChevronDownIcon, ExternalLinkIcon, FileIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react";
import { ActionButton } from "@/components/action-form";
import { LocaleLink } from "@/components/i18n-provider";
import { ChatAvatar } from "@/components/telegram/chat-avatar";
import { ProfileDialog } from "@/components/telegram/profile-dialog";
import { Badge } from "@/components/ui/badge";
import { analyzeTelegramChatAction, resolveTelegramAlertAction } from "@/lib/actions";
import { formatDateTime, formatPrice } from "@/lib/catalog";
import type { T } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { chatListTime, dayKey, dayLabel, isRecentlyActive, messageTime } from "@/lib/telegram/format";
import { alertLabels, dealKindLabels, dealStatusLabels, evidenceText, mediaLabels, paymentLabel, severityLabels } from "@/lib/telegram/labels";
import { mediaKind } from "@/lib/telegram/media-kind";
import { readProfile } from "@/lib/telegram/profile";
import { summarizeDeals } from "@/lib/telegram/stats";
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

/** ፎቶው በገጹ ውስጥ ይታያል (ሲነካ ሙሉ መጠኑ ይከፈታል)፤ ቪዲዮና ድምጽ ማጫወቻ አላቸው። */
function MessageMedia({ t, message }: { t: T; message: Message }) {
  const kind = mediaKind(message.mediaType, message.mimeType);
  const src = `/api/telegram/media/${message.id}`;
  const label = message.mediaType ? t(mediaLabels[message.mediaType] ?? "Media") : "";
  if (kind === "image") {
    return (
      <a href={`${src}?full=1`} target="_blank" rel="noreferrer" className="mb-1 block" title={t("Open full size")}>
        <Image
          unoptimized
          src={src}
          alt={label}
          width={message.mediaFile?.width ?? 320}
          height={message.mediaFile?.height ?? 320}
          loading="lazy"
          className="h-auto max-h-80 w-auto max-w-full rounded-xl bg-background/30 object-contain"
        />
      </a>
    );
  }
  if (kind === "video") return <video controls preload="none" src={src} className="mb-1 max-h-80 max-w-full rounded-xl" aria-label={label} />;
  if (kind === "audio") return <audio controls preload="none" src={src} className="mb-1 h-10 w-64 max-w-full" aria-label={label} />;
  if (kind === "file") {
    return (
      <a href={src} target="_blank" rel="noreferrer" className="mb-1 flex items-center gap-2 text-xs font-semibold underline">
        <FileIcon className="size-4" />
        {t("Open file")}
      </a>
    );
  }
  return label ? <span className="block text-xs font-semibold">[{label}]</span> : null;
}

function MessageBubble({ t, message }: { t: T; message: Message }) {
  const outgoing = message.direction === "OUT";
  return (
    // id፦ ከማስጠንቀቂያ ሲመጡ (#m-…) በቀጥታ ወደዚህ መልዕክት ይሄዳል፤ :target ያደምቀዋል።
    <div
      id={`m-${message.id}`}
      className={cn(
        "flex scroll-mt-24 flex-col gap-1 rounded-xl p-1 target:bg-primary/15 target:ring-2 target:ring-primary",
        outgoing ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm break-words whitespace-pre-line sm:max-w-[75%]",
          outgoing ? "bg-[var(--tg-bubble-out,var(--primary))] text-white" : "bg-secondary text-secondary-foreground",
          message.flagged && "ring-2 ring-destructive",
          message.deletedAt && "opacity-60"
        )}
      >
        {message.mediaType ? <MessageMedia t={t} message={message} /> : null}
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

export async function ChatView({ chat, backHref, now }: { chat: ChatData; backHref: string; now: Date }) {
  const t = await getT();
  const openAlerts = chat.alerts.filter((alert) => !alert.resolved);
  const loadedIds = new Set(chat.messages.map((message) => message.id));
  const activeNow = isRecentlyActive(chat.lastInboundAt, now);
  const deals = summarizeDeals(chat.deals);
  const profile = readProfile(chat.profile);

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
      className="flex h-[calc(100dvh-9rem)] min-h-[28rem] min-w-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 lg:h-[calc(100dvh-var(--tg-offset,18rem))] lg:min-h-[24rem]"
    >
      <header className="flex items-center gap-3 border-b border-border p-4">
        <LocaleLink href={backHref} aria-label={t("Back to chats")} className="text-muted-foreground hover:text-foreground lg:hidden">
          <ArrowLeftIcon className="size-5" />
        </LocaleLink>
        <ChatAvatar name={chat.name} active={activeNow} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-center gap-1">
            <h1 className="truncate font-semibold">{chat.name}</h1>
            <ProfileDialog
              name={chat.name}
              username={chat.username}
              telegramId={chat.chatId}
              profile={profile}
              stats={{
                firstSeen: formatDateTime(chat.createdAt),
                messages: chat._count.messages,
                deals: chat.deals.length,
                paid: deals.paidEtb > 0 ? formatPrice(t, deals.paidEtb) : null,
              }}
            />
          </div>
          <span className="truncate text-xs text-muted-foreground">
            {activeNow ? (
              <span className="font-medium text-primary">{t("Active now")} · </span>
            ) : chat.lastInboundAt ? (
              <span>{t("Last active {time}", { time: chatListTime(chat.lastInboundAt, now) })} · </span>
            ) : null}
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
          <div className="flex max-h-52 flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm">
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
                <div className="flex items-center gap-2">
                  {alert.messageId && loadedIds.has(alert.messageId) ? (
                    <a
                      href={`#m-${alert.messageId}`}
                      className="rounded-xl px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/40 transition-colors hover:bg-primary/10"
                    >
                      {alert.type === "DELETED_MESSAGE" ? t("Show deleted message") : t("Go to message")}
                    </a>
                  ) : null}
                  <ActionButton action={resolveTelegramAlertAction} id={alert.id} variant="outline" size="sm">
                    {t("Mark resolved")}
                  </ActionButton>
                </div>
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
      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto bg-background">
        <div className="flex flex-col gap-2 p-4">
          {chat.truncated ? (
            <p className="self-center text-xs text-muted-foreground">{t("Showing the latest {count} messages.", { count: TELEGRAM_CHAT_PAGE })}</p>
          ) : null}
          {items.map((item) =>
            item.kind === "day" ? (
              <p key={`day-${item.key}`} className="my-2 self-center rounded-xl bg-[var(--tg-service,var(--muted))] px-3 py-1 text-xs font-medium text-foreground/90">
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
