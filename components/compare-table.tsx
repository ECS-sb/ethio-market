"use client";

import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { useCompare } from "@/components/compare-store";
import { LocaleLink, useT } from "@/components/i18n-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categories, countries, formatCount, formatPrice, getPlatform, labelOf, listingStatusLabels } from "@/lib/catalog";
import type { T } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";
import type { PublicListing } from "@/lib/queries";

const rows: { label: MessageKey; value: (listing: PublicListing, t: T) => string }[] = [
  { label: "Platform", value: (listing) => getPlatform(listing.platform)?.name ?? "" },
  { label: "Price", value: (listing, t) => formatPrice(t, listing.priceEtb) },
  { label: "Followers", value: (listing) => formatCount(listing.followers) },
  { label: "Engagement", value: (listing) => (listing.engagement === null ? "—" : `${listing.engagement}%`) },
  { label: "Posts", value: (listing) => (listing.posts === null ? "—" : formatCount(listing.posts)) },
  { label: "Category", value: (listing, t) => t(labelOf(categories, listing.category)) },
  { label: "Main country", value: (listing, t) => t(labelOf(countries, listing.country)) },
  { label: "Year created", value: (listing) => (listing.joinedYear === null ? "—" : String(listing.joinedYear)) },
  { label: "Original email", value: (listing, t) => (listing.originalEmail ? t("Included") : t("Not included")) },
  { label: "Status", value: (listing, t) => t(listingStatusLabels[listing.status]) },
  { label: "Seller", value: (listing) => listing.sellerName },
];

export function CompareTable() {
  const t = useT();
  const { ids, toggle, clear } = useCompare();
  const key = ids.join(",");
  const [loaded, setLoaded] = useState<{ key: string; items: PublicListing[] } | null>(null);

  useEffect(() => {
    if (!key) return;
    let active = true;
    fetch(`/api/listings?ids=${encodeURIComponent(key)}`)
      .then((response) => (response.ok ? response.json() : []))
      .catch(() => [])
      .then((items: PublicListing[]) => {
        if (active) setLoaded({ key, items });
      });
    return () => {
      active = false;
    };
  }, [key]);

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <p className="font-semibold">{t("You haven't chosen any accounts to compare")}</p>
        <p className="text-sm text-muted-foreground">{t("Press “Compare” in the market.")}</p>
        <LocaleLink href="/accounts" className={buttonVariants()}>
          {t("Go to the market")}
        </LocaleLink>
      </div>
    );
  }

  if (!loaded || loaded.key !== key) return <Skeleton className="h-96 rounded-xl" />;
  const items = ids.flatMap((id) => loaded.items.filter((item) => item.id === id));

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Criteria")}</TableHead>
              {items.map((listing) => (
                <TableHead key={listing.id}>
                  <div className="flex items-center gap-2 py-2">
                    <LocaleLink href={`/accounts/${listing.id}`} className="hover:underline" dir="ltr">
                      @{listing.handle}
                    </LocaleLink>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={t("Remove @{handle}", { handle: listing.handle })}
                      onClick={() => toggle(listing.id)}
                    >
                      <XIcon />
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="text-muted-foreground">{t(row.label)}</TableCell>
                {items.map((listing) => (
                  <TableCell key={listing.id}>{row.value(listing, t)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button variant="outline" className="w-fit" onClick={clear}>
        {t("Remove all")}
      </Button>
    </div>
  );
}
