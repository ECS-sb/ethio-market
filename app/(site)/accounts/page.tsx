import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AccountsFilters } from "@/components/accounts-filters";
import { PageIntro } from "@/components/brand";
import { ListingCard } from "@/components/listing-card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { searchListings } from "@/lib/queries";

export const metadata: Metadata = { title: "ገበያ" };

type Params = Promise<Record<string, string | string[] | undefined>>;

const FILTER_KEYS = ["q", "platform", "category", "country", "followers", "price", "seller", "verified", "special", "sort"] as const;

function ResultsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-80 rounded-xl" />
      ))}
    </div>
  );
}

async function Results({ searchParams }: { searchParams: Params }) {
  await connection();
  const raw = await searchParams;
  const get = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : undefined);
  const { items, total, page, pages } = await searchListings({
    q: get("q"),
    platform: get("platform"),
    category: get("category"),
    country: get("country"),
    followers: get("followers"),
    price: get("price"),
    seller: get("seller"),
    verified: get("verified") === "1",
    special: get("special") === "1",
    sort: get("sort"),
    page: Number(get("page")) || 1,
  });

  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const value = get(key);
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const text = query.toString();
    return text ? `/accounts?${text}` : "/accounts";
  };

  return (
    <>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {total} አካውንቶች ተገኝተዋል
      </p>
      {items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
          <p className="font-semibold">የሚስማማ አካውንት አልተገኘም</p>
          <p className="text-sm text-muted-foreground">ማጣሪያዎቹን ቀንሰው እንደገና ይሞክሩ።</p>
        </div>
      )}
      {pages > 1 ? (
        <nav aria-label="ገጾች" className="flex items-center justify-between gap-4">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={buttonVariants({ variant: "outline" })}>
              ቀዳሚ
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            ገጽ {page} ከ{pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className={buttonVariants({ variant: "outline" })}>
              ቀጣይ
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}

export default function AccountsPage({ searchParams }: { searchParams: Params }) {
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
      <Suspense fallback={<ResultsSkeleton />}>
        <AccountsFilters>
          <Suspense fallback={<ResultsSkeleton />}>
            <Results searchParams={searchParams} />
          </Suspense>
        </AccountsFilters>
      </Suspense>
    </>
  );
}
