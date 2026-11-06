import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/action-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { withdrawOfferAction } from "@/lib/actions";
import { formatDate, formatPrice, getPlatform, offerStatusLabels } from "@/lib/catalog";
import { getBuyerOffers } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "ቅናሾቼ" };

export default async function BuyerOffersPage() {
  const user = await requireUser("/dashboard/buyer");
  const offers = await getBuyerOffers(user.id);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="text-3xl font-semibold">ቅናሾቼ</h1>
        <Link href="/accounts" className={buttonVariants()}>
          ገበያውን ይመልከቱ
        </Link>
      </div>
      {offers.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">ገና ቅናሽ አላቀረቡም።</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {offers.map((offer) => (
            <li key={offer.id} className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-semibold text-primary">{formatPrice(offer.amountEtb)}</p>
                <p className="text-sm text-muted-foreground">
                  <Link href={`/accounts/${offer.listingId}`} className="hover:underline" dir="ltr">
                    @{offer.handle}
                  </Link>{" "}
                  · {getPlatform(offer.platform)?.name} · {formatDate(offer.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">የተጠየቀ ዋጋ፦ {formatPrice(offer.askingEtb)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={offer.status === "ACCEPTED" ? "default" : "secondary"}>{offerStatusLabels[offer.status]}</Badge>
                {offer.status === "PENDING" ? (
                  <ActionButton action={withdrawOfferAction} id={offer.id} variant="outline">
                    ሰርዝ
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
