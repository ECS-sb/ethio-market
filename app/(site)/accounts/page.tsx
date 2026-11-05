import { Suspense } from "react";
import type { Metadata } from "next";
import { AccountsBrowser } from "@/components/accounts-browser";
import { PageIntro } from "@/components/brand";
import { ListingCard } from "@/components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import { activeListings } from "@/lib/data";

export const metadata: Metadata = { title: "ገበያ" };

export default function AccountsPage() {
  const cards = Object.fromEntries(
    activeListings.map((listing) => [listing.id, <ListingCard key={listing.id} listing={listing} />])
  );

  return (
    <>
      <PageIntro
        eyebrow="ገበያ"
        title={
          <>
            የሚፈልጉትን <span className="text-gold">አካውንት</span> ያግኙ።
          </>
        }
        description="በመድረክ፣ በዘርፍ፣ በተከታይ ብዛት እና በዋጋ ያጣሩ።"
      />
      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-80 rounded-xl" />
            ))}
          </div>
        }
      >
        <AccountsBrowser cards={cards} />
      </Suspense>
    </>
  );
}
