import { ActionButton } from "@/components/action-form";
import { LocaleLink } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { withdrawOfferAction } from "@/lib/actions";
import { formatDate, formatPrice, getPlatform, offerStatusLabels } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getBuyerOffers } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const generateMetadata = pageTitle("My offers");

export default async function BuyerOffersPage() {
  const t = await getT();
  const user = await requireUser("/dashboard/buyer");
  const offers = await getBuyerOffers(user.id);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="text-3xl font-semibold">{t("My offers")}</h1>
        <LocaleLink href="/accounts" className={buttonVariants()}>
          {t("Browse the market")}
        </LocaleLink>
      </div>
      {offers.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">{t("You haven't made any offers yet.")}</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {offers.map((offer) => (
            <li key={offer.id} className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-semibold text-primary">{formatPrice(t, offer.amountEtb)}</p>
                <p className="text-sm text-muted-foreground">
                  <LocaleLink href={`/accounts/${offer.listingId}`} className="hover:underline" dir="ltr">
                    @{offer.handle}
                  </LocaleLink>{" "}
                  · {getPlatform(offer.platform)?.name} · {formatDate(offer.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">{t("Asking price: {price}", { price: formatPrice(t, offer.askingEtb) })}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={offer.status === "ACCEPTED" ? "default" : "secondary"}>{t(offerStatusLabels[offer.status])}</Badge>
                {offer.status === "PENDING" ? (
                  <ActionButton action={withdrawOfferAction} id={offer.id} variant="outline">
                    {t("Withdraw")}
                  </ActionButton>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
