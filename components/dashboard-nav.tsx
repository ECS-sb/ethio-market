"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FlagIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  ListIcon,
  MessageCircleIcon,
  ReceiptIcon,
  SettingsIcon,
  ShoppingBagIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = {
  user: [
    {
      title: "ገዢ",
      items: [
        { href: "/dashboard/buyer", label: "ቅናሾቼ", icon: ShoppingBagIcon },
        { href: "/dashboard/buyer/orders", label: "ግዢዎቼ", icon: ReceiptIcon },
      ],
    },
    {
      title: "ሻጭ",
      items: [
        { href: "/dashboard/seller", label: "ማስታወቂያዎቼ", icon: StoreIcon },
        { href: "/dashboard/seller/offers", label: "የመጡ ቅናሾች", icon: HandCoinsIcon },
        { href: "/dashboard/seller/orders", label: "ሽያጮቼ", icon: ListIcon },
      ],
    },
    {
      title: "መለያ",
      items: [
        { href: "/dashboard/messages", label: "መልዕክቶች", icon: MessageCircleIcon },
        { href: "/dashboard/settings", label: "ቅንብሮች", icon: SettingsIcon },
      ],
    },
  ],
  admin: [
    {
      title: "አድሚን",
      items: [
        { href: "/admin", label: "አጠቃላይ", icon: LayoutDashboardIcon },
        { href: "/admin/listings", label: "ማስታወቂያ ግምገማ", icon: ListChecksIcon },
        { href: "/admin/orders", label: "ትዕዛዞች", icon: ReceiptIcon },
        { href: "/admin/users", label: "ተጠቃሚዎች", icon: UsersIcon },
        { href: "/admin/reports", label: "ሪፖርቶች", icon: FlagIcon },
      ],
    },
  ],
};

export function DashboardNav({ area }: { area: keyof typeof groups }) {
  const pathname = usePathname();

  return (
    <nav aria-label="ዳሽቦርድ" className="flex gap-4 overflow-x-auto [scrollbar-width:none] lg:flex-col">
      {groups[area].map((group) => (
        <div key={group.title} className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-stretch">
          <p className="hidden px-4 pt-2 text-xs font-semibold text-muted-foreground lg:block">{group.title}</p>
          {group.items.map((item) => {
            const active = pathname === item.href || (item.href === "/dashboard/messages" && pathname.startsWith(item.href));
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
        </div>
      ))}
    </nav>
  );
}
