import Link from "next/link";
import { BadgeCheckIcon } from "lucide-react";
import { PlatformMark } from "@/components/brand";
import { CompareToggle } from "@/components/compare-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  categories,
  countries,
  formatCount,
  formatPrice,
  getPlatform,
  getSeller,
  labelOf,
  statusLabels,
  type Listing,
} from "@/lib/data";

export function ListingCard({ listing }: { listing: Listing }) {
  const platform = getPlatform(listing.platform);
  const seller = getSeller(listing.sellerId);
  const sold = listing.status === "sold";

  return (
    <Card className="bg-card/70 backdrop-blur-sm transition-all hover:-translate-y-1 hover:ring-primary/60 [--card-spacing:--spacing(6)]">
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-4">
        <PlatformMark mark={platform?.mark ?? ""} />
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle className="truncate" dir="ltr">
            @{listing.handle}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{platform?.name}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {listing.status !== "available" ? <Badge variant="outline">{statusLabels[listing.status]}</Badge> : null}
          {listing.special ? <Badge>ልዩ ስም</Badge> : null}
          {seller?.verified ? (
            <Badge variant="secondary">
              <BadgeCheckIcon data-icon="inline-start" />
              የተረጋገጠ ሻጭ
            </Badge>
          ) : null}
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{platform?.unit}</dt>
            <dd className="font-semibold">{formatCount(listing.followers)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">ተሳትፎ</dt>
            <dd className="font-semibold">{listing.engagement}%</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">ዘርፍ</dt>
            <dd>{labelOf(categories, listing.category)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">ሀገር</dt>
            <dd>{labelOf(countries, listing.country)}</dd>
          </div>
        </dl>
        <p className="mt-auto text-2xl font-semibold text-primary">{formatPrice(listing.price)}</p>
      </CardContent>
      <CardFooter className="gap-2 border-border bg-transparent">
        <Link
          href={`/accounts/${listing.id}`}
          className={buttonVariants({ variant: sold ? "secondary" : "default", className: "flex-1" })}
        >
          ዝርዝር
        </Link>
        {sold ? null : <CompareToggle id={listing.id} />}
      </CardFooter>
    </Card>
  );
}
