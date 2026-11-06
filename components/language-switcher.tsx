"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/i18n-provider";
import { localePath, locales, stripLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const labels = { en: "EN", am: "አማ" };
const names = { en: "English", am: "አማርኛ" };

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = stripLocale(usePathname());
  const query = useSearchParams().toString();

  return (
    <div role="group" aria-label="Language / ቋንቋ" className="flex shrink-0 items-center rounded-full bg-card/70 p-1 ring-1 ring-foreground/10">
      {locales.map((item) => (
        // ቋንቋ መቀየር root layoutን ስለሚቀይር ሙሉ ገጽ መጫን ያስፈልጋል።
        <a
          key={item}
          href={`${localePath(item, pathname)}${query ? `?${query}` : ""}`}
          hrefLang={item}
          lang={item}
          title={names[item]}
          aria-current={item === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            item === locale ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {labels[item]}
        </a>
      ))}
    </div>
  );
}
