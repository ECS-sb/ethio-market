import Image from "next/image";
import { BadgeCheckIcon } from "lucide-react";
import { PlatformMark } from "@/components/brand";
import { CompareToggle } from "@/components/compare-toggle";
import { LocaleLink } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { categories, countries, formatCount, formatPrice, getPlatform, labelOf, listingStatusLabels } from "@/lib/catalog";
import { getT } from "@/lib/i18n-server";
import type { PublicListing } from "@/lib/queries";

export async function ListingCard({ listing }: { listing: PublicListing }) {
  const t = await getT();
  const platform = getPlatform(listing.platform);
  const sold = listing.status === "SOLD";
  const cover = listing.images[0];

  return (
    <Card className="bg-card/70 backdrop-blur-sm transition-all hover:-translate-y-1 hover:ring-primary/60 [--card-spacing:--spacing(6)]">
      {cover ? (
        <div className="px-6">
          <Image
            unoptimized
            src={`/api/listing-images/${cover.id}?size=thumb`}
            alt={t("Channel screenshots")}
            width={cover.width}
            height={cover.height}
            loading="lazy"
            className={`aspect-video w-full rounded-xl bg-secondary object-cover object-top ${sold ? "opacity-60 grayscale" : ""}`}
          />
        </div>
      ) : null}
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
          <Badge variant={sold ? "secondary" : "outline"}>{t(listingStatusLabels[listing.status])}</Badge>
          {listing.special ? <Badge>{t("Special name")}</Badge> : null}
          {listing.monetized ? <Badge>{t("Monetized")}</Badge> : null}
          {listing.sellerVerified ? (
            <Badge variant="secondary">
              <BadgeCheckIcon data-icon="inline-start" />
              {t("Verified seller")}
            </Badge>
          ) : null}
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{t(platform?.unit ?? "Followers")}</dt>
            <dd className="font-semibold">{formatCount(listing.followers)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{t("Engagement")}</dt>
            <dd className="font-semibold">{listing.engagement === null ? "—" : `${listing.engagement}%`}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{t("Category")}</dt>
            <dd>{t(labelOf(categories, listing.category))}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{t("Country")}</dt>
            <dd>{t(labelOf(countries, listing.country))}</dd>
          </div>
        </dl>
        <p className={`mt-auto text-2xl font-semibold ${sold ? "text-muted-foreground" : "text-primary"}`}>{formatPrice(t, listing.priceEtb)}</p>
      </CardContent>
      <CardFooter className="gap-2 border-border bg-transparent">
        <LocaleLink
          href={`/accounts/${listing.id}`}
          className={buttonVariants({ variant: sold ? "secondary" : "default", className: "flex-1" })}
        >
          {t("Details")}
        </LocaleLink>
        {sold ? null : <CompareToggle id={listing.id} />}
      </CardFooter>
    </Card>
  );
}
