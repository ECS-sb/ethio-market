import { PlatformMark } from "@/components/brand";
import { formatCount, formatPrice, illustrationAccounts, illustrationGrowth } from "@/lib/catalog";

function Phone({ account, className }: { account: (typeof illustrationAccounts)[number]; className: string }) {
  const min = Math.min(...illustrationGrowth);
  const span = Math.max(...illustrationGrowth) - min;

  return (
    <div className={`absolute w-44 rounded-[2rem] bg-secondary p-2 shadow-2xl ring-1 ring-foreground/15 sm:w-52 ${className}`}>
      <div className="flex flex-col gap-4 rounded-[1.5rem] bg-background p-4">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-muted" />
        <div className="flex items-center gap-2">
          <PlatformMark mark={account.mark} className="size-8" />
          <span className="truncate text-xs font-semibold" dir="ltr">
            @{account.handle}
          </span>
        </div>
        <div>
          <p className="text-xl font-semibold">{formatCount(account.followers)}</p>
          <p className="text-xs text-muted-foreground">{account.unit}</p>
        </div>
        <div className="flex h-16 items-end gap-1">
          {illustrationGrowth.map((value) => (
            <span key={value} className="flex-1 rounded-sm bg-primary" style={{ height: `${25 + ((value - min) / span) * 75}%` }} />
          ))}
        </div>
        <p className="rounded-xl bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground">
          {formatPrice(account.priceEtb)}
        </p>
      </div>
    </div>
  );
}

/** ምሳሌ ምስል ብቻ ነው፤ ከእውነተኛ ማስታወቂያ ጋር አልተገናኘም። */
export function HeroVisual() {
  return (
    <div aria-hidden className="relative mx-auto h-[26rem] w-full max-w-md sm:h-[32rem]">
      <div className="absolute inset-x-8 bottom-4 h-16 rounded-full bg-primary/30 blur-3xl" />
      <svg viewBox="0 0 400 500" className="absolute inset-0 size-full fill-none stroke-primary/60">
        <ellipse cx="200" cy="170" rx="185" ry="70" transform="rotate(-18 200 170)" strokeWidth="1.5" />
        <ellipse cx="225" cy="340" rx="165" ry="72" transform="rotate(14 225 340)" strokeWidth="1.5" />
        <circle cx="26" cy="222" r="6" className="fill-primary stroke-none" />
        <circle cx="384" cy="376" r="6" className="fill-primary stroke-none" />
      </svg>
      <Phone account={illustrationAccounts[0]} className="top-0 left-2 -rotate-6 sm:left-6" />
      <Phone account={illustrationAccounts[1]} className="right-2 bottom-0 rotate-6 sm:right-4" />
    </div>
  );
}
