import Image from "next/image";
import { ActionButton, ActionForm, SubmitButton } from "@/components/action-form";
import { Input } from "@/components/ui/input";
import { approveListingAction, rejectListingAction } from "@/lib/actions";
import { categories, countries, formatCount, formatPrice, getPlatform, labelOf } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getPendingListings } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const generateMetadata = pageTitle("Listing review");

export default async function AdminListingsPage() {
  const t = await getT();
  await requireAdmin();
  const listings = await getPendingListings();

  return (
    <>
      <h1 className="text-3xl font-semibold">{t("Listing review")}</h1>
      {listings.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">{t("No listings to review.")}</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {listings.map((listing) => (
            <li key={listing.id} className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold break-all" dir="ltr">
                  {getPlatform(listing.platform)?.name} · @{listing.username}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("{count} followers", { count: formatCount(listing.followers) })} · {formatPrice(t, listing.priceEtb)} · {t(labelOf(categories, listing.category))} ·{" "}
                  {t(labelOf(countries, listing.country))}
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  {t("Seller:")} {listing.seller.name} ({listing.seller.email})
                </p>
                {listing.description ? <p className="pt-2 text-sm break-words whitespace-pre-line">{listing.description}</p> : null}
              </div>
              {listing.images.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {listing.images.map((image, index) => (
                      <a key={image.id} href={`/api/listing-images/${image.id}`} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl bg-secondary ring-1 ring-foreground/10 hover:ring-primary/60">
                        <Image
                          unoptimized
                          src={`/api/listing-images/${image.id}?size=thumb`}
                          alt={t("Screenshot {number}", { number: index + 1 })}
                          width={image.width}
                          height={image.height}
                          className="aspect-[4/3] w-full object-cover object-top"
                        />
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("Check that the screenshots match the listing and don't show the channel's name.")}</p>
                </div>
              ) : null}
              <p className="rounded-xl bg-primary/15 p-4 text-sm ring-1 ring-primary/30">
                {t("Before approving, check this code is in the account's bio:")} <code className="font-mono font-semibold text-primary">{listing.verificationCode}</code>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <ActionButton action={approveListingAction} id={listing.id}>
                  {t("Approve")}
                </ActionButton>
                <ActionForm action={rejectListingAction} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={listing.id} />
                  <Input name="reason" placeholder={t("Reason for rejection")} maxLength={300} aria-label={t("Reason for rejection")} className="h-10 max-w-sm" />
                  <SubmitButton variant="outline">{t("Reject")}</SubmitButton>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
