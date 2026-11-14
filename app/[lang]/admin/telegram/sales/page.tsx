import { ActionButton } from "@/components/action-form";
import { LocaleLink } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { analyzePendingTelegramAction } from "@/lib/actions";
import { formatDateTime, formatPrice } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { requireAdmin } from "@/lib/session";
import { dealKindLabels, dealStatusLabels, paymentLabel } from "@/lib/telegram/labels";
import { getTelegramSales } from "@/lib/telegram/queries";

export const generateMetadata = pageTitle("Telegram sales");

/** "ያልተተነተኑትን ተንትን" አዝራሩ Claude እስኪጨርስ ይጠብቃል። */
export const maxDuration = 300;

const statusVariant = { NEGOTIATING: "outline", AGREED: "secondary", PAID: "default", DELIVERED: "default", CANCELLED: "outline" } as const;

function paymentVariant(paidToCompany: boolean | null) {
  return paidToCompany === true ? "default" : paidToCompany === false ? "destructive" : "outline";
}

export default async function AdminTelegramSalesPage() {
  const t = await getT();
  await requireAdmin();
  const data = await getTelegramSales();
  const tiles = [
    { label: t("Sales today"), value: data.today.sales },
    { label: t("Paid today"), value: formatPrice(t, data.today.paidEtb) },
    { label: t("Registrations today"), value: data.today.registrations },
    { label: t("Unverified payments (7 days)"), value: data.week.unverified },
    { label: t("Paid to other accounts (7 days)"), value: data.week.otherAccount },
  ];
  const pendingCount = data.pending.chats + data.pending.receipts;

  return (
    <>
      <h1 className="text-3xl font-semibold">{t("Telegram sales")}</h1>

      {data.aiEnabled ? null : (
        <p className="rounded-xl bg-card/70 p-6 text-sm text-muted-foreground ring-1 ring-destructive/40">
          {t("AI analysis is not set up yet. Add ANTHROPIC_API_KEY in Vercel, as described in docs/telegram-setup.md.")}
        </p>
      )}

      <div className="grid grid-cols-2 gap-6 xl:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="flex flex-col gap-1 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <span className="text-3xl font-semibold text-primary">{tile.value}</span>
            <span className="text-sm text-muted-foreground">{tile.label}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{t("Last 30 days")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("Found by AI from the chats ({model}). Check important sales in the chat itself.", { model: data.model })}
            </p>
          </div>
          {data.aiEnabled && pendingCount > 0 ? (
            <ActionButton action={analyzePendingTelegramAction} id="pending" variant="outline">
              {t("Analyze pending chats ({count})", { count: pendingCount })}
            </ActionButton>
          ) : null}
        </div>

        {data.deals.length === 0 ? (
          <p className="rounded-xl bg-card/70 p-6 text-center text-muted-foreground ring-1 ring-foreground/10">{t("No sales found yet.")}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {data.deals.map((deal) => (
              <li key={deal.id} className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
                <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold break-words">{deal.item}</span>
                    <Badge variant="outline">{t(dealKindLabels[deal.kind])}</Badge>
                    <Badge variant={statusVariant[deal.status]}>{t(dealStatusLabels[deal.status])}</Badge>
                  </div>
                  <span className="text-muted-foreground">
                    <LocaleLink href={`/admin/telegram/${deal.chat.id}`} className="font-medium text-foreground hover:underline">
                      {deal.customerName ?? deal.chat.name}
                    </LocaleLink>
                    {deal.customerPhone ? (
                      <span dir="ltr" className="ms-2">
                        {deal.customerPhone}
                      </span>
                    ) : null}{" "}
                    · {deal.chat.connection.ownerName} · {formatDateTime(deal.dealAt)}
                  </span>
                  {deal.note ? <p className="pt-1 text-muted-foreground">{deal.note}</p> : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-semibold">{deal.amountEtb === null ? "—" : formatPrice(t, deal.amountEtb)}</span>
                  {deal.status === "PAID" || deal.status === "DELIVERED" ? (
                    <Badge variant={paymentVariant(deal.paidToCompany)}>{t(paymentLabel(deal.paidToCompany))}</Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
