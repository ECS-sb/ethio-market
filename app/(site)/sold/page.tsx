import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { PageIntro } from "@/components/brand";
import { ListingCard } from "@/components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSoldListings } from "@/lib/queries";

export const metadata: Metadata = { title: "የተሸጡ አካውንቶች" };

async function SoldList() {
  await connection();
  const sold = await getSoldListings();
  if (sold.length === 0) {
    return (
      <div className="rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <p className="font-semibold">ገና የተሸጠ አካውንት የለም</p>
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

export default function SoldPage() {
  return (
    <>
      <PageIntro
        eyebrow="ገበያ"
        title={
          <>
            በቅርቡ <span className="text-gold">የተሸጡ</span>
          </>
        }
        description="የገበያውን ዋጋ ለመረዳት እነዚህን ይመልከቱ።"
      />
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <SoldList />
      </Suspense>
    </>
  );
}
