import type { Metadata } from "next";
import { PageIntro, SampleNotice } from "@/components/brand";
import { ListingCard } from "@/components/listing-card";
import { listings } from "@/lib/data";

export const metadata: Metadata = { title: "የተሸጡ አካውንቶች" };

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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings
          .filter((listing) => listing.status === "sold")
          .map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
      </div>
      <SampleNotice />
    </>
  );
}
