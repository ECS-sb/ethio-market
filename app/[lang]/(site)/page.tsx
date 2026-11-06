import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import { Eyebrow, PlatformMark } from "@/components/brand";
import { GrowthChart } from "@/components/growth-chart";
import { HeroVisual } from "@/components/hero-visual";
import { LocaleLink } from "@/components/i18n-provider";
import { ListingCard } from "@/components/listing-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  categories,
  followerRanges,
  formatCount,
  howItWorksSteps,
  illustrationGrowth,
  platforms,
  priceRanges,
} from "@/lib/catalog";
import { getT } from "@/lib/i18n-server";
import type { MessageKey } from "@/lib/messages";
import { getFeaturedListings, getPlatformCounts, getTopSellers } from "@/lib/queries";

const pillars: { number: string; title: MessageKey; description: MessageKey; href?: string }[] = [
  {
    number: "01.",
    title: "Ownership is verified",
    description: "Every listing passes a verification code and an admin review.",
  },
  {
    number: "02.",
    title: "Orders, step by step",
    description: "From offer to handover, each step is visible to both buyer and seller.",
    href: "/how-it-works",
  },
  {
    number: "03.",
    title: "Details before you buy",
    description: "Review engagement, audience and the seller's history first.",
  },
];

async function PlatformTiles() {
  await connection();
  const t = await getT();
  const counts = await getPlatformCounts();
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
      {platforms.map((platform) => (
        <LocaleLink
          key={platform.id}
          href={`/accounts?platform=${platform.id}`}
          className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:-translate-y-1 hover:ring-primary/60"
        >
          <PlatformMark mark={platform.mark} />
          <div>
            <p className="font-semibold">{platform.name}</p>
            <p className="text-sm text-muted-foreground">{t("{count} accounts", { count: counts[platform.id] ?? 0 })}</p>
          </div>
        </LocaleLink>
      ))}
    </div>
  );
}

async function Featured() {
  await connection();
  const t = await getT();
  const featured = await getFeaturedListings();
  if (featured.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <p className="font-semibold">{t("No listings yet")}</p>
        <p className="text-sm text-muted-foreground">{t("Be the first seller.")}</p>
        <LocaleLink href="/sell" className={buttonVariants()}>
          {t("Sell an account")}
        </LocaleLink>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

async function TopSellers() {
  await connection();
  const t = await getT();
  const sellers = await getTopSellers(3);
  if (sellers.length === 0) return null;
  return (
    <section className="flex flex-col gap-6 pt-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="text-4xl font-semibold">{t("Top sellers")}</h2>
        <LocaleLink href="/sellers" className={buttonVariants({ variant: "outline" })}>
          {t("All sellers")}
        </LocaleLink>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {sellers.map((seller) => (
          <LocaleLink
            key={seller.id}
            href={`/accounts?seller=${seller.id}`}
            className="flex flex-col gap-2 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:ring-primary/60"
          >
            <p className="font-semibold">{seller.name}</p>
            <p className="text-sm text-muted-foreground">{t("{count} sales", { count: seller.deals })}</p>
          </LocaleLink>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const t = await getT();
  return (
    <>
      <section className="grid items-center gap-6 pt-12 lg:grid-cols-2 lg:pt-20">
        <div className="flex flex-col items-start gap-6">
          <Eyebrow>{t("The account marketplace for Ethiopia")}</Eyebrow>
          <h1 className="text-4xl leading-[1.2] font-extrabold sm:text-6xl">
            {t("Social media accounts")}
            <br />
            <span className="text-gold">{t("Buy and sell")}</span>
            <br />
            {t("the safer way.")}
          </h1>
          <div className="flex w-full items-center gap-6 border-t border-border pt-6">
            <div className="flex -space-x-2">
              {platforms.map((platform) => (
                <PlatformMark key={platform.id} mark={platform.mark} className="size-10 rounded-full bg-secondary" />
              ))}
            </div>
            <div>
              <p className="text-xl font-semibold text-primary">{t("{count} platforms", { count: platforms.length })}</p>
              <p className="text-sm text-muted-foreground">{t("in one market")}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <LocaleLink
              href="/accounts"
              aria-label={t("Go to the market")}
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
            >
              <ArrowUpRightIcon className="size-7" />
            </LocaleLink>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("Browse accounts from Instagram to Telegram, compare them, and buy through a process you can follow step by step.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocaleLink href="/accounts" className={buttonVariants({ size: "lg" })}>
              {t("Browse the market")}
            </LocaleLink>
            <LocaleLink href="/sell" className={buttonVariants({ size: "lg", variant: "outline" })}>
              {t("Sell an account")}
            </LocaleLink>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section aria-labelledby="platforms-heading" className="flex flex-col gap-6 pt-16">
        <h2 id="platforms-heading" className="sr-only">
          {t("Platforms")}
        </h2>
        <Suspense fallback={<Skeleton className="h-36 rounded-xl" />}>
          <PlatformTiles />
        </Suspense>
      </section>

      <section className="flex flex-col gap-12 pt-24">
        <div className="grid items-end gap-6 lg:grid-cols-2">
          <h2 className="text-4xl leading-tight font-semibold">
            <span className="text-gold">{t("Buying and selling")}</span>
            <br />
            {t("with a clear process.")}
          </h2>
          <p className="max-w-lg text-muted-foreground lg:justify-self-end">
            {t("From the moment a listing goes up until an order is complete, every step is clear to both sides.")}
          </p>
        </div>
        <div className="grid items-center gap-6 md:grid-cols-3 md:gap-0">
          {pillars.map((pillar, index) => {
            const highlighted = index === 1;
            return (
              <div
                key={pillar.number}
                className={
                  highlighted
                    ? "z-10 flex flex-col gap-6 rounded-xl bg-primary p-6 py-12 text-primary-foreground shadow-2xl shadow-primary/30"
                    : "flex flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 backdrop-blur-sm"
                }
              >
                <p className={highlighted ? "text-xl font-semibold" : "text-xl font-semibold text-primary"}>{pillar.number}</p>
                <h3 className="text-xl font-semibold">{t(pillar.title)}</h3>
                <p className={highlighted ? "text-sm" : "text-sm text-muted-foreground"}>{t(pillar.description)}</p>
                {pillar.href ? (
                  <LocaleLink href={pillar.href} className="flex items-center gap-2 text-sm font-semibold hover:underline">
                    {t("Learn more")}
                    <ArrowRightIcon className="size-4" />
                  </LocaleLink>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-4xl font-semibold">
            <span className="text-gold">{t("New")}</span> {t("accounts")}
          </h2>
          <LocaleLink href="/accounts" className={buttonVariants({ variant: "outline" })}>
            {t("View all")}
            <ArrowRightIcon data-icon="inline-end" />
          </LocaleLink>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-80 rounded-xl" />
              ))}
            </div>
          }
        >
          <Featured />
        </Suspense>
      </section>

      <section className="flex flex-col gap-6 pt-24">
        <h2 className="text-4xl font-semibold">
          {t("Find it")} <span className="text-gold">{t("fast")}</span>
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <QuickFilter
            title={t("By category")}
            items={categories.map((category) => ({ href: `/accounts?category=${category.value}`, label: t(category.label) }))}
          />
          <QuickFilter
            title={t("By followers")}
            items={followerRanges.map((range) => ({ href: `/accounts?followers=${range.value}`, label: t(range.label) }))}
          />
          <QuickFilter
            title={t("By price")}
            items={priceRanges.map((range) => ({ href: `/accounts?price=${range.value}`, label: t(range.label) }))}
          />
        </div>
      </section>

      <section className="grid items-center gap-12 pt-24 lg:grid-cols-2">
        <div className="relative flex flex-col gap-6">
          <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardDescription>{t("Follower growth")}</CardDescription>
              <CardTitle className="text-2xl font-semibold">{formatCount(illustrationGrowth[illustrationGrowth.length - 1])}</CardTitle>
            </CardHeader>
            <div className="px-6">
              <GrowthChart values={illustrationGrowth} />
            </div>
          </Card>
          <p className="text-xs text-muted-foreground">{t("This image is an example and doesn't represent a real account.")}</p>
        </div>
        <div className="flex flex-col items-start gap-6">
          <h2 className="text-4xl leading-tight font-semibold">
            {t("Before you buy,")}
            <br />
            <span className="text-gold">{t("see the numbers.")}</span>
          </h2>
          <p className="text-muted-foreground">
            {t("Each listing shows followers, engagement, audience and the seller's history. You can also compare accounts side by side.")}
          </p>
          <div className="flex flex-wrap gap-2">
            <LocaleLink href="/compare" className={buttonVariants({ size: "lg" })}>
              {t("Compare accounts")}
              <ArrowRightIcon data-icon="inline-end" />
            </LocaleLink>
            <LocaleLink href="/faq" className={buttonVariants({ size: "lg", variant: "ghost" })}>
              {t("Have a question?")}
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 pt-24">
        <h2 className="text-4xl font-semibold">
          {t("How")} <span className="text-gold">{t("it works")}</span>
        </h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <span className="text-xl font-semibold text-primary">0{index + 1}.</span>
              <h3 className="font-semibold">{t(step.title)}</h3>
              <p className="text-sm text-muted-foreground">{t(step.description)}</p>
            </li>
          ))}
        </ol>
      </section>

      <Suspense fallback={null}>
        <TopSellers />
      </Suspense>

      <section className="pt-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:p-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold">{t("Have an account to sell?")}</h2>
            <p>{t("Set up your listing in a few steps.")}</p>
          </div>
          <LocaleLink href="/sell" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            {t("Start selling")}
            <ArrowRightIcon data-icon="inline-end" />
          </LocaleLink>
        </div>
      </section>
    </>
  );
}

function QuickFilter({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
      <h3 className="font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <LocaleLink
            key={item.href}
            href={item.href}
            className="rounded-xl bg-secondary px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {item.label}
          </LocaleLink>
        ))}
      </div>
    </div>
  );
}
