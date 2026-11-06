"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function UserMenu({ name, image, isAdmin }: { name: string; image: string | null; isAdmin: boolean }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="የመለያ ምናሌ" className="size-10 rounded-full" />}>
        <Avatar>
          {image ? <AvatarImage src={image} alt="" referrerPolicy="no-referrer" /> : null}
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem render={<Link href="/dashboard/buyer" />}>የገዢ ዳሽቦርድ</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/seller" />}>የሻጭ ዳሽቦርድ</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/messages" />}>መልዕክቶች</DropdownMenuItem>
        {isAdmin ? <DropdownMenuItem render={<Link href="/admin" />}>አድሚን</DropdownMenuItem> : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut();
            router.push("/");
            router.refresh();
          }}
        >
          ውጣ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
