import { Suspense } from "react";
import { connection } from "next/server";
import { PageIntro } from "@/components/brand";
import { ListingCard } from "@/components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getSoldListings } from "@/lib/queries";

export const generateMetadata = pageTitle("Sold accounts");

async function SoldList() {
  await connection();
  const t = await getT();
  const sold = await getSoldListings();
  if (sold.length === 0) {
    return (
      <div className="rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <p className="font-semibold">{t("No accounts sold yet")}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sold.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

export default async function SoldPage() {
  const t = await getT();
  return (
    <>
      <PageIntro
        eyebrow={t("Market")}
        title={
          <>
            {t("Recently")} <span className="text-gold">{t("sold")}</span>
          </>
        }
        description={t("See these to understand market prices.")}
      />
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <SoldList />
      </Suspense>
    </>
  );
}
