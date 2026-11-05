"use client";

import Link from "next/link";
import { XIcon } from "lucide-react";
import { useCompare } from "@/components/compare-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  categories,
  countries,
  formatCount,
  formatPrice,
  getListing,
  getPlatform,
  getSeller,
  labelOf,
  type Listing,
} from "@/lib/data";

const rows: { label: string; value: (listing: Listing) => string }[] = [
  { label: "መድረክ", value: (listing) => getPlatform(listing.platform)?.name ?? "" },
  { label: "ዋጋ", value: (listing) => formatPrice(listing.price) },
  { label: "ተከታዮች", value: (listing) => formatCount(listing.followers) },
  { label: "ተሳትፎ", value: (listing) => `${listing.engagement}%` },
  { label: "ልጥፎች", value: (listing) => formatCount(listing.posts) },
  { label: "ዘርፍ", value: (listing) => labelOf(categories, listing.category) },
  { label: "ዋና ሀገር", value: (listing) => labelOf(countries, listing.country) },
  { label: "የተከፈተበት ዓመት", value: (listing) => String(listing.joinedYear) },
  { label: "የመጀመሪያ ኢሜይል", value: (listing) => (listing.originalEmail ? "ይካተታል" : "አይካተትም") },
  { label: "ሻጭ", value: (listing) => getSeller(listing.sellerId)?.name ?? "" },
];

export function CompareTable() {
  const { ids, toggle, clear } = useCompare();
  const items = ids.map(getListing).filter((listing): listing is Listing => Boolean(listing));

  if (items.length === 0) {
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
