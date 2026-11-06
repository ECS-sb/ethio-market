import { Suspense } from "react";
import { Brand, GridBackdrop } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-6">
      <GridBackdrop />
      <Brand />
      <main className="w-full max-w-md rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 backdrop-blur-sm">{children}</main>
      <Suspense fallback={<Skeleton className="h-8 w-20 rounded-full" />}>
        <LanguageSwitcher />
      </Suspense>
    </div>
  );
}
