import type { Metadata } from "next";
import { ActionButton } from "@/components/action-form";
import { Badge } from "@/components/ui/badge";
import { acceptOfferAction, rejectOfferAction } from "@/lib/actions";
import { formatDate, formatPrice, getPlatform, offerStatusLabels } from "@/lib/catalog";
import { getSellerOffers } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "የመጡ ቅናሾች" };

export default async function SellerOffersPage() {
  const user = await requireUser("/dashboard/seller/offers");
  const offers = await getSellerOffers(user.id);

  return (
    <>
      <h1 className="text-3xl font-semibold">የመጡ ቅናሾች</h1>
      {offers.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">ገና ቅናሽ አልመጣም።</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {offers.map((offer) => (
            <li key={offer.id} className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-semibold text-primary">{formatPrice(offer.amountEtb)}</p>
                <p className="text-sm text-muted-foreground">
                  <span dir="ltr">@{offer.username}</span> · {getPlatform(offer.platform)?.name} · {offer.buyerName} · {formatDate(offer.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">የጠየቁት ዋጋ፦ {formatPrice(offer.askingEtb)}</p>
                {offer.note ? <p className="pt-2 text-sm break-words">{offer.note}</p> : null}
              </div>
              {offer.status === "PENDING" ? (
                <div className="flex gap-2">
                  <ActionButton action={rejectOfferAction} id={offer.id} variant="outline">
                    አልቀበልም
                  </ActionButton>
                  <ActionButton action={acceptOfferAction} id={offer.id}>
                    እቀበላለሁ
                  </ActionButton>
                </div>
              ) : (
                <Badge variant={offer.status === "ACCEPTED" ? "default" : "secondary"}>{offerStatusLabels[offer.status]}</Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
