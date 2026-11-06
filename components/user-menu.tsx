"use client";

import { useRouter } from "next/navigation";
import { LocaleLink, useLocale, useT } from "@/components/i18n-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { localePath } from "@/lib/i18n";

export function UserMenu({ name, image, isAdmin }: { name: string; image: string | null; isAdmin: boolean }) {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={t("Account menu")} className="size-10 rounded-full" />}>
        <Avatar>
          {image ? <AvatarImage src={image} alt="" referrerPolicy="no-referrer" /> : null}
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem render={<LocaleLink href="/dashboard/buyer" />}>{t("Buyer dashboard")}</DropdownMenuItem>
        <DropdownMenuItem render={<LocaleLink href="/dashboard/seller" />}>{t("Seller dashboard")}</DropdownMenuItem>
        <DropdownMenuItem render={<LocaleLink href="/dashboard/messages" />}>{t("Messages")}</DropdownMenuItem>
        {isAdmin ? <DropdownMenuItem render={<LocaleLink href="/admin" />}>{t("Admin")}</DropdownMenuItem> : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut();
            router.push(localePath(locale, "/"));
            router.refresh();
          }}
        >
          {t("Sign out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
