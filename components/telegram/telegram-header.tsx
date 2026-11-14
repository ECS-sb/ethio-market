import { getT } from "@/lib/i18n-server";
import type { Inbox } from "@/lib/telegram/inbox";
import { cn } from "@/lib/utils";

/** ከላይ ያለው አጭር ማጠቃለያ፦ ጠቅላላ ሰዎች፣ የዛሬ መልዕክቶች፣ የምላሽ ጊዜ እና የተገናኙ አካውንቶች። */
export async function TelegramHeader({ inbox }: { inbox: Inbox }) {
  const t = await getT();
  const stats = [
    { label: t("People who messaged"), value: inbox.counts.all },
    { label: t("Customer messages today"), value: inbox.today.inbound },
    { label: t("Replies sent today"), value: inbox.today.outbound },
    {
      label: t("Average reply time today"),
      value: inbox.today.replies.averageMinutes === null ? "—" : t("{minutes} min", { minutes: inbox.today.replies.averageMinutes }),
    },
    { label: t("Waiting for a reply"), value: inbox.counts.waiting },
    { label: t("With alerts"), value: inbox.counts.alerts, alert: inbox.counts.alerts > 0 },
  ];

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-semibold">{t("Telegram monitoring")}</h1>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {inbox.connections.length === 0 ? <span>{t("No Telegram account is connected yet.")}</span> : null}
          {inbox.connections.map((connection) => (
            <span key={connection.id} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", connection.isEnabled ? "bg-primary" : "bg-muted-foreground")} />
              {connection.ownerName}
              {connection.isEnabled ? null : ` · ${t("Paused")}`}
            </span>
          ))}
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col rounded-xl bg-card/70 px-4 py-3 ring-1 ring-foreground/10">
            <dt className="order-2 text-xs text-muted-foreground">{stat.label}</dt>
            <dd className={cn("order-1 text-xl font-semibold", stat.alert ? "text-destructive" : "text-primary")}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
