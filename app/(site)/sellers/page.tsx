import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheckIcon } from "lucide-react";
import { PageIntro, SampleNotice } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activeListings, countries, labelOf, sellers } from "@/lib/data";

export const metadata: Metadata = { title: "ሻጮች" };

export default function SellersPage() {
  const ranked = [...sellers].sort((a, b) => b.deals - a.deals);

  return (
    <>
      <PageIntro
        eyebrow="ሻጮች"
        title={
          <>
            ምርጥ <span className="text-gold">ሻጮች</span>
          </>
        }
        description="በተጠናቀቁ ሽያጮች ብዛት የተደረደሩ።"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((seller) => (
          <Card key={seller.id} className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {seller.name}
                {seller.verified ? <BadgeCheckIcon aria-label="የተረጋገጠ ሻጭ" className="size-4 text-primary" /> : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">ደረጃ</dt>
                  <dd className="font-semibold">★ {seller.rating}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">ሽያጮች</dt>
                  <dd className="font-semibold">{seller.deals}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">አባል ከ</dt>
                  <dd className="font-semibold">{seller.joinedYear}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">ሀገር</dt>
                  <dd className="font-semibold">{labelOf(countries, seller.country)}</dd>
                </div>
              </dl>
              <Link href={`/accounts?seller=${seller.id}`} className={buttonVariants({ variant: "outline" })}>
                {activeListings.filter((listing) => listing.sellerId === seller.id).length} አካውንቶች
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <SampleNotice />
    </>
  );
}
