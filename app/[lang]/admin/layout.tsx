import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GridBackdrop } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { Header } from "@/components/header";
import { SIDEBAR_COOKIE, SidebarLayout } from "@/components/sidebar-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getT } from "@/lib/i18n-server";
import { requireAdmin } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: { default: t("Admin"), template: `%s | ${t("Admin")}` }, robots: { index: false } };
}

async function AdminNav() {
  await requireAdmin();
  return <DashboardNav area="admin" />;
}

/** ምናሌው ጠብቦ እንደተተወ cookie-ው ይነግረናል፤ ገጹ ሲከፈት ሳይዘል በዚያው መጠን ይታያል። */
async function AdminShell({ children }: { children: React.ReactNode }) {
  const compact = (await cookies()).get(SIDEBAR_COOKIE)?.value === "compact";
  return (
    <SidebarLayout
      initialCompact={compact}
      nav={
        <Suspense fallback={<Skeleton className="h-11 rounded-xl" />}>
          <AdminNav />
        </Suspense>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>{children}</Suspense>
    </SidebarLayout>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col">
      <GridBackdrop />
      <Header />
      <Suspense
        fallback={
          <div className="mx-auto grid w-full max-w-7xl flex-1 content-start items-start gap-6 p-6 lg:grid-cols-[16rem_1fr]">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        }
      >
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </div>
  );
}
