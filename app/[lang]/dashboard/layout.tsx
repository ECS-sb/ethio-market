import { Suspense } from "react";
import type { Metadata } from "next";
import { GridBackdrop } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: { default: t("Dashboard"), template: `%s | ${t("Dashboard")}` }, robots: { index: false } };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col">
      <GridBackdrop />
      <Header />
      <div className="mx-auto grid w-full max-w-7xl flex-1 content-start items-start gap-6 p-6 lg:grid-cols-[16rem_1fr]">
        <aside className="min-w-0 rounded-xl bg-card/70 p-2 ring-1 ring-foreground/10 lg:sticky lg:top-24">
          <Suspense fallback={<Skeleton className="h-11 rounded-xl" />}>
            <DashboardNav area="user" />
          </Suspense>
        </aside>
        <main className="flex min-w-0 flex-col gap-6">
          <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
