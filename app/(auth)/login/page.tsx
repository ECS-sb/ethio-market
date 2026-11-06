import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignIn } from "@/components/google-sign-in";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser, safeNextPath } from "@/lib/session";

export const metadata: Metadata = { title: "ይግቡ" };

type Params = Promise<Record<string, string | string[] | undefined>>;

async function LoginContent({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const suspended = params.error === "suspended";
  const user = await getCurrentUser();
  if (user && !user.suspended && !suspended) redirect(next);

  return (
    <div className="flex flex-col gap-6">
      {suspended || user?.suspended ? (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          ይህ መለያ ታግዷል። ለበለጠ መረጃ ያግኙን።
        </p>
      ) : null}
      <GoogleSignIn next={next} />
    </div>
  );
}

export default function LoginPage({ searchParams }: { searchParams: Params }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">እንኳን ደህና መጡ</h1>
        <p className="text-sm text-muted-foreground">በGmail መለያዎ ይግቡ ወይም ይመዝገቡ።</p>
      </div>
      <Suspense fallback={<Skeleton className="h-12 rounded-xl" />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
      <p className="text-center text-xs text-muted-foreground">
        በመቀጠልዎ{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          የአገልግሎት ውሉን
        </Link>{" "}
        እና{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          የግላዊነት ፖሊሲውን
        </Link>{" "}
        ተቀብለዋል።
      </p>
    </div>
  );
}
