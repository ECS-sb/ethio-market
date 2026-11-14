import { initials } from "@/lib/telegram/format";
import { cn } from "@/lib/utils";

export function ChatAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary", className)}
    >
      {initials(name)}
    </span>
  );
}
