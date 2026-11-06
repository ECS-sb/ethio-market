"use client";

import { createContext, use, useMemo } from "react";
import Link from "next/link";
import { createT, localePath, type Locale, type T } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("en");

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return use(LocaleContext);
}

export function useT(): T {
  const locale = useLocale();
  return useMemo(() => createT(locale), [locale]);
}

type LinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** አሁን ባለው ቋንቋ የሚቀጥል ሊንክ። */
export function LocaleLink({ href, ...props }: LinkProps) {
  const locale = useLocale();
  return <Link href={localePath(locale, href)} {...props} />;
}
