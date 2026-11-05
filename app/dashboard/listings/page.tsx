import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, getListing, getPlatform, myListings, statusLabels } from "@/lib/data";

export const metadata: Metadata = { title: "ማስታወቂያዎቼ" };

export default function MyListingsPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="text-3xl font-semibold">ማስታወቂያዎቼ</h1>
        <Link href="/sell" className={buttonVariants()}>
          አዲስ ማስታወቂያ
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>አካውንት</TableHead>
              <TableHead>መድረክ</TableHead>
              <TableHead>ዋጋ</TableHead>
              <TableHead>ዕይታ</TableHead>
              <TableHead>ቅናሽ</TableHead>
              <TableHead>ሁኔታ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myListings.map((item) => {
              const listing = getListing(item.listingId);
              if (!listing) return null;
              return (
                <TableRow key={item.listingId}>
                  <TableCell>
                    <Link href={`/accounts/${listing.id}`} className="font-medium hover:underline" dir="ltr">
                      @{listing.handle}
                    </Link>
                  </TableCell>
                  <TableCell>{getPlatform(listing.platform)?.name}</TableCell>
                  <TableCell>{formatPrice(listing.price)}</TableCell>
                  <TableCell>{item.views}</TableCell>
                  <TableCell>{item.offers}</TableCell>
                  <TableCell>
                    <Badge variant={listing.status === "available" ? "default" : "secondary"}>{statusLabels[listing.status]}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
