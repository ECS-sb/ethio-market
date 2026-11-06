import type { Metadata } from "next";
import { ActionButton, ActionForm, SubmitButton } from "@/components/action-form";
import { Input } from "@/components/ui/input";
import { approveListingAction, rejectListingAction } from "@/lib/actions";
import { categories, countries, formatCount, formatPrice, getPlatform, labelOf } from "@/lib/catalog";
import { getPendingListings } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "ማስታወቂያ ግምገማ" };

export default async function AdminListingsPage() {
  await requireAdmin();
  const listings = await getPendingListings();

  return (
    <>
      <h1 className="text-3xl font-semibold">ማስታወቂያ ግምገማ</h1>
      {listings.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">የሚገመገም ማስታወቂያ የለም።</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {listings.map((listing) => (
            <li key={listing.id} className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold break-all" dir="ltr">
                  {getPlatform(listing.platform)?.name} · @{listing.username}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatCount(listing.followers)} ተከታዮች · {formatPrice(listing.priceEtb)} · {labelOf(categories, listing.category)} · {labelOf(countries, listing.country)}
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  ሻጭ፦ {listing.seller.name} ({listing.seller.email})
                </p>
                {listing.description ? <p className="pt-2 text-sm break-words whitespace-pre-line">{listing.description}</p> : null}
              </div>
              <p className="rounded-xl bg-primary/15 p-4 text-sm ring-1 ring-primary/30">
                ከማጽደቅዎ በፊት ይህ ኮድ በአካውንቱ መግለጫ ላይ መኖሩን ያረጋግጡ፦ <code className="font-mono font-semibold text-primary">{listing.verificationCode}</code>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <ActionButton action={approveListingAction} id={listing.id}>
                  አጽድቅ
                </ActionButton>
                <ActionForm action={rejectListingAction} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={listing.id} />
                  <Input name="reason" placeholder="ውድቅ የተደረገበት ምክንያት" maxLength={300} aria-label="ውድቅ የተደረገበት ምክንያት" className="h-10 max-w-sm" />
                  <SubmitButton variant="outline">ውድቅ አድርግ</SubmitButton>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
