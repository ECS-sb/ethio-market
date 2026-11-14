"use client";

import { createContext, use, useState } from "react";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SIDEBAR_COOKIE = "admin_nav";

const SidebarCompactContext = createContext(false);

/** ምናሌው ሲጠብ (አዶዎች ብቻ) true ነው፤ ከዚህ layout ውጭ ሁልጊዜ false። */
export function useSidebarCompact(): boolean {
  return use(SidebarCompactContext);
}

/** የአድሚን ገጾች፦ በግራ በኩል ያለው ምናሌ ሊጠብ (አዶዎች ብቻ) ወይም ሊሰፋ ይችላል፤ ምርጫው በcookie ይታወሳል። */
export function SidebarLayout({ initialCompact, nav, children }: { initialCompact: boolean; nav: React.ReactNode; children: React.ReactNode }) {
  const t = useT();
  const [compact, setCompact] = useState(initialCompact);
  const toggle = () => {
    const next = !compact;
    setCompact(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "compact" : "full"}; path=/; max-age=31536000; samesite=lax`;
  };
  const label = compact ? t("Expand menu") : t("Collapse menu");

  return (
    <SidebarCompactContext value={compact}>
      <div
        className={cn(
          "mx-auto grid w-full max-w-7xl flex-1 content-start items-start gap-6 p-6",
          compact ? "lg:grid-cols-[4rem_1fr]" : "lg:grid-cols-[16rem_1fr]"
        )}
      >
        <aside className="flex min-w-0 flex-col gap-1 rounded-xl bg-card/70 p-2 ring-1 ring-foreground/10 lg:sticky lg:top-24">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            aria-label={label}
            title={label}
            className={cn("hidden text-muted-foreground lg:inline-flex", compact ? "self-center" : "self-end")}
          >
            {compact ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
          </Button>
          {nav}
        </aside>
        <main className="flex min-w-0 flex-col gap-6">{children}</main>
      </div>
    </SidebarCompactContext>
  );
}
