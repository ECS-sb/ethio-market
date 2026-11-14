"use client";

import { usePathname } from "next/navigation";
import {
  FlagIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  ListIcon,
  MessageCircleIcon,
  ReceiptIcon,
  SendIcon,
  SettingsIcon,
  ShoppingBagIcon,
  StoreIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { LocaleLink, useT } from "@/components/i18n-provider";
import { stripLocale } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";
import { cn } from "@/lib/utils";

type Group = { title: MessageKey; items: { href: string; label: MessageKey; icon: LucideIcon }[] };

const groups: Record<"user" | "admin", Group[]> = {
  user: [
    {
      title: "Buyer",
      items: [
        { href: "/dashboard/buyer", label: "My offers", icon: ShoppingBagIcon },
        { href: "/dashboard/buyer/orders", label: "My purchases", icon: ReceiptIcon },
      ],
    },
    {
      title: "Seller",
      items: [
        { href: "/dashboard/seller", label: "My listings", icon: StoreIcon },
        { href: "/dashboard/seller/offers", label: "Received offers", icon: HandCoinsIcon },
        { href: "/dashboard/seller/orders", label: "My sales", icon: ListIcon },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/dashboard/messages", label: "Messages", icon: MessageCircleIcon },
        { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
      ],
    },
  ],
  admin: [
    {
      title: "Admin",
      items: [
        { href: "/admin", label: "Overview", icon: LayoutDashboardIcon },
        { href: "/admin/listings", label: "Listing review", icon: ListChecksIcon },
        { href: "/admin/orders", label: "Orders", icon: ReceiptIcon },
        { href: "/admin/users", label: "Users", icon: UsersIcon },
        { href: "/admin/reports", label: "Reports", icon: FlagIcon },
        { href: "/admin/telegram", label: "Telegram", icon: SendIcon },
      ],
    },
  ],
};

export function DashboardNav({ area }: { area: keyof typeof groups }) {
  const t = useT();
  const pathname = stripLocale(usePathname());

  return (
    <nav aria-label={t("Dashboard")} className="flex gap-4 overflow-x-auto [scrollbar-width:none] lg:flex-col">
      {groups[area].map((group) => (
        <div key={group.title} className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-stretch">
          <p className="hidden px-4 pt-2 text-xs font-semibold text-muted-foreground lg:block">{t(group.title)}</p>
          {group.items.map((item) => {
            const hasSubpages = item.href === "/dashboard/messages" || item.href === "/admin/telegram";
            const active = pathname === item.href || (hasSubpages && pathname.startsWith(item.href));
            return (
              <LocaleLink
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {t(item.label)}
              </LocaleLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
