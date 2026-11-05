"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontalIcon } from "lucide-react";
import { SampleNotice } from "@/components/brand";
import { FieldSelect } from "@/components/field-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  activeListings,
  categories,
  countries,
  followerRanges,
  getSeller,
  platforms,
  priceRanges,
  sortOptions,
  type Listing,
  type Option,
} from "@/lib/data";

const ALL = "all";
const platformOptions: Option[] = platforms.map((platform) => ({ value: platform.id, label: platform.name }));

function withAll(options: Option[]): Option[] {
  return [{ value: ALL, label: "ሁሉም" }, ...options];
}

function inRange(value: number, ranges: { value: string; min: number; max: number }[], selected: string | null) {
  const range = ranges.find((item) => item.value === selected);
  return !range || (value >= range.min && value < range.max);
}

function sortListings(items: Listing[], sort: string): Listing[] {
  const sorted = [...items];
  if (sort === "newest") return sorted.sort((a, b) => Number(b.id) - Number(a.id));
  if (sort === "price-asc") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return sorted.sort((a, b) => b.price - a.price);
  if (sort === "followers-desc") return sorted.sort((a, b) => b.followers - a.followers);
  return sorted;
}

export function AccountsBrowser({ cards }: { cards: Record<string, React.ReactNode> }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const results = useMemo(() => {
    const query = (params.get("q") ?? "").trim().toLowerCase();
    const filtered = activeListings.filter((listing) => {
      const seller = getSeller(listing.sellerId);
      return (
        (!query ||
          listing.handle.toLowerCase().includes(query) ||
          listing.platform.includes(query)) &&
        (!params.get("platform") || listing.platform === params.get("platform")) &&
        (!params.get("category") || listing.category === params.get("category")) &&
        (!params.get("country") || listing.country === params.get("country")) &&
        (!params.get("seller") || listing.sellerId === params.get("seller")) &&
        (!params.get("special") || listing.special) &&
        (!params.get("verified") || seller?.verified === true) &&
        inRange(listing.followers, followerRanges, params.get("followers")) &&
        inRange(listing.price, priceRanges, params.get("price"))
      );
    });
    return sortListings(filtered, params.get("sort") ?? "recommended");
  }, [params]);

  const hasFilters = [...params.keys()].some((key) => key !== "sort");

  const filters = (
    <div className="flex flex-col gap-6">
      <FilterSelect label="መድረክ" id="platform" options={platformOptions} value={params.get("platform")} onChange={(value) => setParam("platform", value)} />
      <FilterSelect label="ዘርፍ" id="category" options={categories} value={params.get("category")} onChange={(value) => setParam("category", value)} />
      <FilterSelect label="የተከታይ ብዛት" id="followers" options={followerRanges} value={params.get("followers")} onChange={(value) => setParam("followers", value)} />
      <FilterSelect label="ዋጋ" id="price" options={priceRanges} value={params.get("price")} onChange={(value) => setParam("price", value)} />
      <FilterSelect label="ሀገር" id="country" options={countries} value={params.get("country")} onChange={(value) => setParam("country", value)} />
      <div className="flex items-center gap-2">
        <Checkbox id="verified" checked={params.has("verified")} onCheckedChange={(checked) => setParam("verified", checked ? "1" : null)} />
        <Label htmlFor="verified">የተረጋገጡ ሻጮች ብቻ</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="special" checked={params.has("special")} onCheckedChange={(checked) => setParam("special", checked ? "1" : null)} />
        <Label htmlFor="special">ልዩ የተጠቃሚ ስሞች ብቻ</Label>
      </div>
      {hasFilters ? (
        <Button variant="outline" onClick={() => router.replace(pathname, { scroll: false })}>
          ማጣሪያዎችን አጽዳ
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
      <aside aria-label="ማጣሪያዎች" className="sticky top-24 hidden rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 lg:block">
        {filters}
      </aside>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            key={params.get("q") ?? ""}
            type="search"
            aria-label="አካውንት ፈልግ"
            placeholder="በስም ወይም በመድረክ ፈልግ…"
            defaultValue={params.get("q") ?? ""}
            onKeyDown={(event) => {
              if (event.key === "Enter") setParam("q", event.currentTarget.value.trim() || null);
            }}
            onBlur={(event) => {
              const value = event.currentTarget.value.trim();
              if (value !== (params.get("q") ?? "")) setParam("q", value || null);
            }}
          />
          <div className="flex items-center gap-2 sm:w-64 sm:shrink-0">
            <div className="flex-1">
              <FieldSelect
                value={params.get("sort") ?? "recommended"}
                onChange={(value) => setParam("sort", value === "recommended" ? null : value)}
                options={sortOptions}
              />
            </div>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" aria-label="ማጣሪያዎች" className="size-11 lg:hidden" />}>
                <SlidersHorizontalIcon />
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>ማጣሪያዎች</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">{filters}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <p aria-live="polite" className="text-sm text-muted-foreground">
          {results.length} አካውንቶች ተገኝተዋል
        </p>

        {results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((listing) => (
              <div key={listing.id} className="contents">
                {cards[listing.id]}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
            <p className="font-semibold">የሚስማማ አካውንት አልተገኘም</p>
            <p className="text-sm text-muted-foreground">ማጣሪያዎቹን ቀንሰው እንደገና ይሞክሩ።</p>
            <Button variant="outline" onClick={() => router.replace(pathname, { scroll: false })}>
              ማጣሪያዎችን አጽዳ
            </Button>
          </div>
        )}
        <SampleNotice />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  id,
  options,
  value,
  onChange,
}: {
  label: string;
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <FieldSelect id={id} value={value ?? ALL} onChange={onChange} options={withAll(options)} />
    </div>
  );
}
