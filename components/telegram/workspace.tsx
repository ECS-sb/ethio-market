"use client";

import { useRef, useState, type CSSProperties } from "react";
import { ChartColumnIcon, ChevronUpIcon } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { clampListWidth, LIST_COOKIE, LIST_DEFAULT, LIST_MAX, LIST_MIN, saveLayoutPref, STATS_COOKIE } from "@/lib/telegram/layout-prefs";
import { telegramTheme } from "@/lib/telegram/theme";
import { cn } from "@/lib/utils";

/**
 * የቴሌግራም ገጹ አቀማመጥ፦ ከላይ ያሉት ቁጥሮች ሊደበቁ ይችላሉ (ቻቱ ይረዝማል)፣ እና በዝርዝሩና በቻቱ መካከል
 * ያለው መስመር ተጎትቶ ስፋቱ ይቀየራል። ሁለቱም በcookie ይታወሳሉ። ውስጣቸው ያሉት ክፍሎች ከሰርቨር ይመጣሉ።
 * --tg-offset ቁጥሮቹ ሲታዩ/ሲደበቁ ከፓኖቹ በላይ ያለው ከፍታ ነው (ፓኖቹ የቀረውን ስክሪን ይሞላሉ)።
 */
export function TelegramWorkspace({
  mode,
  initialStatsOpen,
  initialListWidth,
  stats,
  folders,
  list,
  main,
}: {
  mode: "list" | "chat";
  initialStatsOpen: boolean;
  initialListWidth: number;
  stats: React.ReactNode;
  folders: React.ReactNode;
  list: React.ReactNode;
  main: React.ReactNode;
}) {
  const t = useT();
  const [statsOpen, setStatsOpen] = useState(initialStatsOpen);
  const [listWidth, setListWidth] = useState(initialListWidth);
  const widthRef = useRef(initialListWidth);
  const drag = useRef<{ x: number; width: number } | null>(null);

  const setWidth = (value: number) => {
    const next = clampListWidth(value);
    widthRef.current = next;
    setListWidth(next);
  };
  const commitWidth = () => saveLayoutPref(LIST_COOKIE, String(widthRef.current));
  const toggleStats = () => {
    const next = !statsOpen;
    setStatsOpen(next);
    saveLayoutPref(STATS_COOKIE, next ? "shown" : "hidden");
  };
  const statsLabel = statsOpen ? t("Hide analytics") : t("Show analytics");
  const direction = () => (document.documentElement.dir === "rtl" ? -1 : 1);

  return (
    <div
      className="flex min-w-0 flex-col gap-4"
      style={{ ...telegramTheme, "--tg-offset": statsOpen ? "17rem" : "10.5rem", "--tg-list": `${listWidth}px` } as CSSProperties}
    >
      <div className={cn("flex-col gap-4", mode === "chat" ? "hidden lg:flex" : "flex")}>
        {statsOpen ? stats : null}
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1">{folders}</div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={toggleStats} aria-label={statsLabel} title={statsLabel} aria-expanded={statsOpen}>
            {statsOpen ? <ChevronUpIcon /> : <ChartColumnIcon />}
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[var(--tg-list)_0.75rem_minmax(0,1fr)] lg:gap-0">
        <div className={cn("min-w-0", mode === "chat" && "hidden lg:block")}>{list}</div>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t("Resize the chat list")}
          aria-valuenow={listWidth}
          aria-valuemin={LIST_MIN}
          aria-valuemax={LIST_MAX}
          tabIndex={0}
          title={t("Drag to resize. Double-click to reset.")}
          className="group hidden cursor-col-resize touch-none items-center justify-center outline-none lg:flex"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, width: widthRef.current };
          }}
          onPointerMove={(event) => {
            if (drag.current) setWidth(drag.current.width + (event.clientX - drag.current.x) * direction());
          }}
          onPointerUp={() => {
            if (!drag.current) return;
            drag.current = null;
            commitWidth();
          }}
          onDoubleClick={() => {
            setWidth(LIST_DEFAULT);
            commitWidth();
          }}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 64 : 16;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              setWidth(widthRef.current + (event.key === "ArrowRight" ? step : -step) * direction());
              commitWidth();
            }
          }}
        >
          <span className="h-16 w-1 rounded-full bg-foreground/15 transition-colors group-hover:bg-primary group-focus-visible:bg-primary" />
        </div>
        {main}
      </div>
    </div>
  );
}
