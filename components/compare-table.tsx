"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { XIcon } from "lucide-react";
import { useCompare } from "@/components/compare-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categories, countries, formatCount, formatPrice, getPlatform, labelOf, listingStatusLabels } from "@/lib/catalog";
import type { PublicListing } from "@/lib/queries";

const rows: { label: string; value: (listing: PublicListing) => string }[] = [
  { label: "መድረክ", value: (listing) => getPlatform(listing.platform)?.name ?? "" },
  { label: "ዋጋ", value: (listing) => formatPrice(listing.priceEtb) },
  { label: "ተከታዮች", value: (listing) => formatCount(listing.followers) },
  { label: "ተሳትፎ", value: (listing) => (listing.engagement === null ? "—" : `${listing.engagement}%`) },
  { label: "ልጥፎች", value: (listing) => (listing.posts === null ? "—" : formatCount(listing.posts)) },
  { label: "ዘርፍ", value: (listing) => labelOf(categories, listing.category) },
  { label: "ዋና ሀገር", value: (listing) => labelOf(countries, listing.country) },
  { label: "የተከፈተበት ዓመት", value: (listing) => (listing.joinedYear === null ? "—" : String(listing.joinedYear)) },
  { label: "የመጀመሪያ ኢሜይል", value: (listing) => (listing.originalEmail ? "ይካተታል" : "አይካተትም") },
  { label: "ሁኔታ", value: (listing) => listingStatusLabels[listing.status] },
  { label: "ሻጭ", value: (listing) => listing.sellerName },
];

export function CompareTable() {
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
        <p className="font-semibold">ለማወዳደር ገና አካውንት አልመረጡም</p>
        <p className="text-sm text-muted-foreground">በገበያው ውስጥ “አወዳድር” የሚለውን ይጫኑ።</p>
        <Link href="/accounts" className={buttonVariants()}>
          ወደ ገበያው ይሂዱ
        </Link>
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
              <TableHead>መስፈርት</TableHead>
              {items.map((listing) => (
                <TableHead key={listing.id}>
                  <div className="flex items-center gap-2 py-2">
                    <Link href={`/accounts/${listing.id}`} className="hover:underline" dir="ltr">
                      @{listing.handle}
                    </Link>
                    <Button variant="ghost" size="icon-xs" aria-label={`@${listing.handle} አስወግድ`} onClick={() => toggle(listing.id)}>
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
                <TableCell className="text-muted-foreground">{row.label}</TableCell>
                {items.map((listing) => (
                  <TableCell key={listing.id}>{row.value(listing)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button variant="outline" className="w-fit" onClick={clear}>
        ሁሉንም አስወግድ
      </Button>
    </div>
  );
}
