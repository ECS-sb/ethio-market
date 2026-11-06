"use client";

import { useState } from "react";
import Form from "next/form";
import { MenuIcon, SearchIcon } from "lucide-react";
import { useCompare } from "@/components/compare-store";
import { LocaleLink, useLocale, useT } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { localePath, type MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const links: { href: string; label: MessageKey }[] = [
  { href: "/accounts", label: "Market" },
  { href: "/sell", label: "Sell" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/sellers", label: "Sellers" },
  { href: "/faq", label: "FAQ" },
];

const mobileExtras: { href: string; label: MessageKey }[] = [
  { href: "/compare", label: "Compare" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader({
  brand,
  languageSlot,
  authSlot,
}: {
  brand: React.ReactNode;
  languageSlot: React.ReactNode;
  authSlot: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { ids } = useCompare();
  const t = useT();
  const locale = useLocale();
  const searchAction = localePath(locale, "/accounts");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-4 sm:gap-6 sm:px-6">
        {brand}

        <nav aria-label={t("Main")} className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <LocaleLink
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.label)}
            </LocaleLink>
          ))}
        </nav>

        <Form action={searchAction} role="search" className="relative ml-auto hidden w-56 xl:block">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" aria-label={t("Search accounts")} placeholder={t("Search accounts…")} className="pl-10" />
        </Form>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          {languageSlot}
          <LocaleLink href="/compare" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}>
            {t("Compare")}
            {ids.length > 0 ? <Badge>{ids.length}</Badge> : null}
          </LocaleLink>
          {authSlot}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="outline" size="icon" aria-label={t("Open menu")} className="size-10 lg:hidden" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{t("Menu")}</SheetTitle>
              </SheetHeader>
              <nav aria-label={t("Mobile")} className="flex flex-col gap-2 px-4 pb-6">
                <Form action={searchAction} role="search" className="pb-2" onSubmit={() => setOpen(false)}>
                  <Input name="q" aria-label={t("Search accounts")} placeholder={t("Search accounts…")} />
                </Form>
                {[...links, ...mobileExtras].map((link) => (
                  <LocaleLink
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm transition-colors hover:bg-muted"
                  >
                    {t(link.label)}
                  </LocaleLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
