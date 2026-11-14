import { ActionButton } from "@/components/action-form";
import { AutoRefresh } from "@/components/auto-refresh";
import { LocaleLink } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { resolveTelegramAlertAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { requireAdmin } from "@/lib/session";
import { alertLabels, evidenceText, mediaLabels, severityLabels } from "@/lib/telegram/labels";
import { getTelegramOverview } from "@/lib/telegram/queries";

export const generateMetadata = pageTitle("Telegram monitoring");

const severityVariant = { HIGH: "destructive", MEDIUM: "default", LOW: "outline" } as const;

export default async function AdminTelegramPage() {
  const t = await getT();
  await requireAdmin();
  const data = await getTelegramOverview();
  const tiles = [
    { label: t("Customer messages today"), value: data.inboundToday },
    { label: t("Replies sent today"), value: data.outboundToday },
    { label: t("Waiting for a reply"), value: data.waiting },
    { label: t("Open alerts"), value: data.openAlerts },
    {
      label: t("Average reply time today"),
      value: data.replies.averageMinutes === null ? "—" : t("{minutes} min", { minutes: data.replies.averageMinutes }),
    },
  ];

  return (
    <>
      <AutoRefresh intervalMs={30000} />
      <h1 className="text-3xl font-semibold">{t("Telegram monitoring")}</h1>

      <div className="grid grid-cols-2 gap-6 xl:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="flex flex-col gap-1 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <span className="text-3xl font-semibold text-primary">{tile.value}</span>
            <span className="text-sm text-muted-foreground">{tile.label}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("Connected accounts")}</h2>
        {data.connections.length === 0 ? (
          <p className="rounded-xl bg-card/70 p-6 text-center text-muted-foreground ring-1 ring-foreground/10">
            {t("No Telegram account is connected yet. Follow the setup guide in docs/telegram-setup.md.")}
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {data.connections.map((connection) => (
              <li key={connection.id} className="flex flex-col gap-2 rounded-xl bg-card/70 p-6 text-sm ring-1 ring-foreground/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    {connection.ownerName}
                    {connection.ownerUsername ? (
                      <span className="ms-2 font-normal text-muted-foreground" dir="ltr">
                        @{connection.ownerUsername}
                      </span>
                    ) : null}
                  </span>
                  <Badge variant={connection.isEnabled ? "default" : "outline"}>{connection.isEnabled ? t("Active") : t("Paused")}</Badge>
                </div>
                <span className="text-muted-foreground">
                  {t("{in} customer messages · {out} staff messages", { in: connection.inbound, out: connection.outbound })}
                </span>
                {connection.inbound > 0 && connection.outbound === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {t("If staff messages stay at 0 after you reply from the account, Telegram isn't sending them to the bot.")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("Alerts")}</h2>
        {data.alerts.length === 0 ? (
          <p className="rounded-xl bg-card/70 p-6 text-center text-muted-foreground ring-1 ring-foreground/10">{t("No open alerts.")}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {data.alerts.map((alert) => (
              <li key={alert.id} className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
                <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={severityVariant[alert.severity]}>{t(severityLabels[alert.severity])}</Badge>
                    <span className="font-semibold">{t(alertLabels[alert.type])}</span>
                    <code dir="ltr" className="rounded-xl bg-muted px-2 py-0.5 text-xs break-all">
                      {evidenceText(t, alert.type, alert.evidence)}
                    </code>
                  </div>
                  <span className="text-muted-foreground">
                    <LocaleLink href={`/admin/telegram/${alert.chat.id}`} className="font-medium text-foreground hover:underline">
                      {alert.chat.name}
                    </LocaleLink>{" "}
                    · {alert.chat.connection.ownerName} · {formatDateTime(alert.createdAt)}
                  </span>
                  {alert.message?.text ? <p className="line-clamp-3 pt-2 break-words whitespace-pre-line text-muted-foreground">{alert.message.text}</p> : null}
                </div>
                <ActionButton action={resolveTelegramAlertAction} id={alert.id} variant="outline">
                  {t("Mark resolved")}
                </ActionButton>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("Recent chats")}</h2>
        {data.chats.length === 0 ? (
          <p className="rounded-xl bg-card/70 p-6 text-center text-muted-foreground ring-1 ring-foreground/10">{t("No chats yet.")}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {data.chats.map((chat) => {
              const last = chat.messages[0];
              const preview = last ? last.text || (last.mediaType ? t(mediaLabels[last.mediaType] ?? "Media") : "") : "";
              return (
                <li key={chat.id}>
                  <LocaleLink
                    href={`/admin/telegram/${chat.id}`}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:ring-primary/60"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                      <span className="font-semibold">
                        {chat.name}
                        {chat.username ? (
                          <span className="ms-2 font-normal text-muted-foreground" dir="ltr">
                            @{chat.username}
                          </span>
                        ) : null}
                      </span>
                      <span className="truncate text-muted-foreground">
                        {last?.direction === "OUT" ? `${t("Staff")}: ` : ""}
                        {preview}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                      <span>
                        {chat.connection.ownerName} · {formatDateTime(chat.lastMessageAt)}
                      </span>
                      <span className="flex gap-2">
                        {chat.lastDirection === "IN" ? <Badge variant="secondary">{t("Waiting")}</Badge> : null}
                        {chat._count.alerts > 0 ? <Badge variant="destructive">{t("{count} alerts", { count: chat._count.alerts })}</Badge> : null}
                      </span>
                    </div>
                  </LocaleLink>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
