import { GridBackdrop } from "@/components/brand";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col">
      <GridBackdrop />
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
