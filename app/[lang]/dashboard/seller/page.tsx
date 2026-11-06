import { ActionButton, ActionForm, SubmitButton } from "@/components/action-form";
import { LocaleLink } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { archiveListingAction, updatePriceAction } from "@/lib/actions";
import { formatCount, getPlatform, listingStatusLabels } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getSellerListings } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const generateMetadata = pageTitle("My listings");

export default async function SellerListingsPage() {
  const t = await getT();
  const user = await requireUser("/dashboard/seller");
  const listings = await getSellerListings(user.id);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="text-3xl font-semibold">{t("My listings")}</h1>
        <LocaleLink href="/sell" className={buttonVariants()}>
          {t("New listing")}
        </LocaleLink>
      </div>
      {listings.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">{t("You haven't posted any listings yet.")}</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {listings.map((listing) => (
            <li key={listing.id} className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <LocaleLink href={`/accounts/${listing.id}`} className="font-semibold break-all hover:underline" dir="ltr">
                    @{listing.username}
                  </LocaleLink>
                  <p className="text-sm text-muted-foreground">
                    {getPlatform(listing.platform)?.name} · {t("{count} followers", { count: formatCount(listing.followers) })} ·{" "}
                    {t("{count} new offers", { count: listing._count.offers })}
                  </p>
                </div>
                <Badge variant={listing.status === "APPROVED" ? "default" : "secondary"}>{t(listingStatusLabels[listing.status])}</Badge>
              </div>

              {listing.status === "PENDING" ? (
                <p className="rounded-xl bg-primary/15 p-4 text-sm ring-1 ring-primary/30">
                  {t("Put this code in the account's bio:")} <code className="font-mono font-semibold text-primary">{listing.verificationCode}</code>
                </p>
              ) : null}
              {listing.status === "REJECTED" ? (
                <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{listing.rejectReason || t("This listing was rejected.")}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                {listing.status === "PENDING" || listing.status === "APPROVED" ? (
                  <ActionForm action={updatePriceAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={listing.id} />
                    <Input
                      name="priceEtb"
                      type="number"
                      min={1}
                      step={1}
                      required
                      defaultValue={listing.priceEtb}
                      aria-label={t("Price (ETB)")}
                      className="h-10 w-36"
                    />
                    <SubmitButton variant="outline">{t("Change price")}</SubmitButton>
                  </ActionForm>
                ) : null}
                {listing.status === "PENDING" || listing.status === "APPROVED" || listing.status === "REJECTED" ? (
                  <ActionButton action={archiveListingAction} id={listing.id} variant="ghost">
                    {t("Remove")}
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
