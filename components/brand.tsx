import Image from "next/image";
import { LocaleLink } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <LocaleLink href="/" aria-label="Ethio Market" className={cn("flex items-center gap-2", className)}>
      <Image src="/brand/logo-mark.svg" alt="" width={40} height={40} className="size-10" />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-xl font-extrabold tracking-tight text-primary">Ethio</span>
        <span className="text-xs font-semibold tracking-wide">MARKET</span>
      </span>
    </LocaleLink>
  );
}

export function PlatformMark({ mark, className }: { mark: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/30",
        className
      )}
    >
      {mark}
    </span>
  );
}

export function GridBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[72px_72px] mask-[linear-gradient(to_bottom,black,transparent_70rem)]" />
      <div className="absolute inset-x-0 top-0 h-[48rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]" />
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex w-fit items-center gap-2 rounded-full bg-card/70 px-4 py-2 text-xs font-medium ring-1 ring-foreground/10">
      <span aria-hidden className="size-2 rounded-full bg-primary" />
      {children}
    </p>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <header className="flex max-w-3xl flex-col gap-4 pt-12">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="text-4xl leading-tight font-extrabold sm:text-5xl">{title}</h1>
      {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
    </header>
  );
}
