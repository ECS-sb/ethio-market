"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontalIcon } from "lucide-react";
import { FieldSelect } from "@/components/field-select";
import { useLocale, useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categories, countries, followerRanges, platforms, priceRanges, sortOptions, type Option } from "@/lib/catalog";
import { localePath, stripLocale } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";

const ALL = "all";
const DEFAULT_SORT = "newest";
const platformOptions: Option[] = platforms.map((platform) => ({ value: platform.id, label: platform.name as MessageKey }));

export function AccountsFilters({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const pathname = localePath(locale, stripLocale(usePathname()));
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
      <FilterSelect label="Platform" id="platform" options={platformOptions} value={params.get("platform")} onChange={(value) => setParam("platform", value)} />
      <FilterSelect label="Category" id="category" options={categories} value={params.get("category")} onChange={(value) => setParam("category", value)} />
      <FilterSelect label="Followers" id="followers" options={followerRanges} value={params.get("followers")} onChange={(value) => setParam("followers", value)} />
      <FilterSelect label="Price" id="price" options={priceRanges} value={params.get("price")} onChange={(value) => setParam("price", value)} />
      <FilterSelect label="Country" id="country" options={countries} value={params.get("country")} onChange={(value) => setParam("country", value)} />
      <div className="flex items-center gap-2">
        <Checkbox id="verified" checked={params.has("verified")} onCheckedChange={(checked) => setParam("verified", checked ? "1" : null)} />
        <Label htmlFor="verified">{t("Verified sellers only")}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="special" checked={params.has("special")} onCheckedChange={(checked) => setParam("special", checked ? "1" : null)} />
        <Label htmlFor="special">{t("Special usernames only")}</Label>
      </div>
      {hasFilters ? (
        <Button variant="outline" onClick={clear}>
          {t("Clear filters")}
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
      <aside aria-label={t("Filters")} className="sticky top-24 hidden rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 lg:block">
        {filters}
      </aside>
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            key={params.get("q") ?? ""}
            type="search"
            aria-label={t("Search accounts")}
            placeholder={t("Search by description or platform…")}
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
              <SheetTrigger render={<Button variant="outline" size="icon" aria-label={t("Filters")} className="size-11 lg:hidden" />}>
                <SlidersHorizontalIcon />
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t("Filters")}</SheetTitle>
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
  label: MessageKey;
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{t(label)}</Label>
      <FieldSelect id={id} value={value ?? ALL} onChange={onChange} options={[{ value: ALL, label: "All" }, ...options]} />
    </div>
  );
}
