"use client";

import { useState } from "react";
import Form from "next/form";
import Link from "next/link";
import { MenuIcon, SearchIcon } from "lucide-react";
import { Brand } from "@/components/brand";
import { useCompare } from "@/components/compare-store";
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
import { cn } from "@/lib/utils";

const links = [
  { href: "/accounts", label: "ገበያ" },
  { href: "/sell", label: "ይሽጡ" },
  { href: "/how-it-works", label: "እንዴት ይሰራል" },
  { href: "/sellers", label: "ሻጮች" },
  { href: "/faq", label: "ጥያቄዎች" },
];

export function SiteHeader({ authSlot }: { authSlot: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { ids } = useCompare();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-6 py-4">
        <Brand className="shrink-0" />

        <nav aria-label="ዋና" className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Form action="/accounts" role="search" className="relative ml-auto hidden w-64 xl:block">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" aria-label="አካውንት ፈልግ" placeholder="አካውንት ፈልግ…" className="pl-10" />
        </Form>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <Link href="/compare" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}>
            አወዳድር
            {ids.length > 0 ? <Badge>{ids.length}</Badge> : null}
          </Link>
          {authSlot}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="outline" size="icon" aria-label="ምናሌ ክፈት" className="size-10 lg:hidden" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>ምናሌ</SheetTitle>
              </SheetHeader>
              <nav aria-label="የሞባይል" className="flex flex-col gap-2 px-4 pb-6">
                <Form action="/accounts" role="search" className="pb-2" onSubmit={() => setOpen(false)}>
                  <Input name="q" aria-label="አካውንት ፈልግ" placeholder="አካውንት ፈልግ…" />
                </Form>
                {[...links, { href: "/compare", label: "አወዳድር" }, { href: "/dashboard", label: "ዳሽቦርድ" }].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
