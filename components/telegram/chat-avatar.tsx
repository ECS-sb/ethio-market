import { initials } from "@/lib/telegram/format";
import { cn } from "@/lib/utils";

/** active፦ ደንበኛው በቅርቡ (5 ደቂቃ ውስጥ) ከጻፈ ትንሽ ነጥብ ይታያል። */
export function ChatAvatar({ name, active = false, className }: { name: string; active?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("relative flex size-11 shrink-0", className)}>
      <span className="flex size-full items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">{initials(name)}</span>
      {active ? <span className="absolute end-0 bottom-0 size-3 rounded-full bg-primary ring-2 ring-card" /> : null}
    </span>
  );
}
