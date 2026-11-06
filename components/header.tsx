import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

async function HeaderAuth() {
  const user = await getCurrentUser();
  if (!user || user.suspended) {
    return (
      <Link href="/login" className={buttonVariants()}>
        ይግቡ
      </Link>
    );
  }
  return <UserMenu name={user.name} image={user.image} isAdmin={user.isAdmin} />;
}

export function Header() {
  return (
    <SiteHeader
      authSlot={
        <Suspense fallback={<Skeleton className="size-10 rounded-full" />}>
          <HeaderAuth />
        </Suspense>
      }
    />
  );
}
