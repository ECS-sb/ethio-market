"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontalIcon } from "lucide-react";
import { FieldSelect } from "@/components/field-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categories, countries, followerRanges, platforms, priceRanges, sortOptions, type Option } from "@/lib/catalog";

const ALL = "all";
const DEFAULT_SORT = "newest";
const platformOptions: Option[] = platforms.map((platform) => ({ value: platform.id, label: platform.name }));

export function AccountsFilters({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const hasFilters = [...params.keys()].some((key) => key !== "sort" && key !== "page");
  const clear = () => router.replace(pathname, { scroll: false });

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
        <Button variant="outline" onClick={clear}>
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
            placeholder="በመግለጫ ወይም በመድረክ ፈልግ…"
            defaultValue={params.get("q") ?? ""}
            onKeyDown={(event) => {
              if (event.key === "Enter") setParam("q", event.currentTarget.value.trim() || null);
            }}
          />
          <div className="flex items-center gap-2 sm:w-64 sm:shrink-0">
            <div className="flex-1">
              <FieldSelect
                value={params.get("sort") ?? DEFAULT_SORT}
                onChange={(value) => setParam("sort", value === DEFAULT_SORT ? null : value)}
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
        {children}
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
      <FieldSelect id={id} value={value ?? ALL} onChange={onChange} options={[{ value: ALL, label: "ሁሉም" }, ...options]} />
    </div>
  );
}
