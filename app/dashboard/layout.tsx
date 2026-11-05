import type { Metadata } from "next";
import { GridBackdrop, SampleNotice } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "ዳሽቦርድ", template: "%s | ዳሽቦርድ" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col">
      <GridBackdrop />
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-6 p-6 lg:grid-cols-[16rem_1fr]">
        <aside className="min-w-0 rounded-xl bg-card/70 p-2 ring-1 ring-foreground/10 lg:sticky lg:top-24">
          <DashboardNav />
        </aside>
        <main className="flex min-w-0 flex-col gap-6">
          {children}
          <SampleNotice />
        </main>
      </div>
    </div>
  );
}
