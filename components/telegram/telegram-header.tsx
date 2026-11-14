import { getT } from "@/lib/i18n-server";
import type { Inbox } from "@/lib/telegram/inbox";
import { cn } from "@/lib/utils";

/** ከላይ ያሉት ቁጥሮች፦ ጠቅላላ ሰዎች፣ የዛሬ መልዕክቶች፣ የምላሽ ጊዜ፣ የሚጠብቁ እና ማስጠንቀቂያ። ርዕሱ ቦታ ለመቆጠብ ለስክሪን አንባቢ ብቻ ነው። */
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
    <header>
      <h1 className="sr-only">{t("Telegram monitoring")}</h1>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
            <dt className="order-2 text-xs text-muted-foreground">{stat.label}</dt>
            <dd className={cn("order-1 text-xl font-semibold", stat.alert ? "text-destructive" : "text-[var(--tg-link,var(--primary))]")}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
