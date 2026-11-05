"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HandCoinsIcon,
  LayoutDashboardIcon,
  ListIcon,
  MessageCircleIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "አጠቃላይ", icon: LayoutDashboardIcon },
  { href: "/dashboard/listings", label: "ማስታወቂያዎቼ", icon: ListIcon },
  { href: "/dashboard/offers", label: "ቅናሾች", icon: HandCoinsIcon },
  { href: "/dashboard/orders", label: "Escrow ትዕዛዞች", icon: ShieldCheckIcon },
  { href: "/dashboard/messages", label: "መልዕክቶች", icon: MessageCircleIcon },
  { href: "/dashboard/settings", label: "ቅንብሮች", icon: SettingsIcon },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="ዳሽቦርድ" className="flex gap-2 overflow-x-auto [scrollbar-width:none] lg:flex-col">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
