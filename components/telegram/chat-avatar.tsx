import { initials } from "@/lib/telegram/format";
import { cn } from "@/lib/utils";

// እንደ ቴሌግራም፦ እያንዳንዱ ሰው በስሙ መሰረት ከእነዚህ ሰባት ቀለሞች አንዱን ያገኛል (ሁልጊዜ ያው ቀለም)።
const AVATAR_COLORS = ["bg-[#e17076]", "bg-[#faa774]", "bg-[#a695e7]", "bg-[#7bc862]", "bg-[#6ec9cb]", "bg-[#65aadd]", "bg-[#ee7aae]"];

function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** active፦ ደንበኛው በቅርቡ (5 ደቂቃ ውስጥ) ከጻፈ ትንሽ ነጥብ ይታያል። */
export function ChatAvatar({ name, active = false, className }: { name: string; active?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("relative flex size-11 shrink-0", className)}>
      <span className={cn("flex size-full items-center justify-center rounded-full text-sm font-semibold text-white", colorFor(name))}>{initials(name)}</span>
      {active ? <span className="absolute end-0 bottom-0 size-3 rounded-full bg-primary ring-2 ring-card" /> : null}
    </span>
  );
}
