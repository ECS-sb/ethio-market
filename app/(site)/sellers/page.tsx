import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BadgeCheckIcon } from "lucide-react";
import { PageIntro } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTopSellers } from "@/lib/queries";

export const metadata: Metadata = { title: "ሻጮች" };

async function SellersList() {
  await connection();
  const sellers = await getTopSellers();
  if (sellers.length === 0) {
    return (
      <div className="rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <p className="font-semibold">ገና የተጠናቀቀ ሽያጭ የለም</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sellers.map((seller) => (
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
                <dt className="text-xs text-muted-foreground">ሽያጮች</dt>
                <dd className="font-semibold text-primary">{seller.deals}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">አባል ከ</dt>
                <dd className="font-semibold">{seller.since}</dd>
              </div>
            </dl>
            <Link href={`/accounts?seller=${seller.id}`} className={buttonVariants({ variant: "outline" })}>
              {seller.activeListings} አካውንቶች
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SellersPage() {
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
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <SellersList />
      </Suspense>
    </>
  );
}
