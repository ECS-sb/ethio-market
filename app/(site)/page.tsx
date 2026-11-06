import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import { Eyebrow, PlatformMark, SampleNotice } from "@/components/brand";
import { GrowthChart } from "@/components/growth-chart";
import { HeroVisual } from "@/components/hero-visual";
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
import { getFeaturedListings, getPlatformCounts, getTopSellers } from "@/lib/queries";

const pillars = [
  {
    number: "01.",
    title: "ባለቤትነት ይረጋገጣል",
    description: "እያንዳንዱ ማስታወቂያ በማረጋገጫ ኮድ እና በአስተዳዳሪ ግምገማ ያልፋል።",
  },
  {
    number: "02.",
    title: "ትዕዛዝ ደረጃ በደረጃ",
    description: "ከቅናሽ እስከ ርክክብ ያለው እያንዳንዱ ደረጃ ለገዢውም ለሻጩም ይታያል።",
    href: "/how-it-works",
  },
  {
    number: "03.",
    title: "መረጃ ከመግዛት በፊት",
    description: "ተሳትፎን፣ አድማጮችን እና የሻጩን ታሪክ አስቀድመው ይገምግሙ።",
  },
];

async function PlatformTiles() {
  await connection();
  const counts = await getPlatformCounts();
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
      {platforms.map((platform) => (
        <Link
          key={platform.id}
          href={`/accounts?platform=${platform.id}`}
          className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:-translate-y-1 hover:ring-primary/60"
        >
          <PlatformMark mark={platform.mark} />
          <div>
            <p className="font-semibold">{platform.name}</p>
            <p className="text-sm text-muted-foreground">{counts[platform.id] ?? 0} አካውንቶች</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function Featured() {
  await connection();
  const featured = await getFeaturedListings();
  if (featured.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <p className="font-semibold">ገና ማስታወቂያ አልወጣም</p>
        <p className="text-sm text-muted-foreground">የመጀመሪያው ሻጭ ይሁኑ።</p>
        <Link href="/sell" className={buttonVariants()}>
          አካውንት ይሽጡ
        </Link>
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
  const sellers = await getTopSellers(3);
  if (sellers.length === 0) return null;
  return (
    <section className="flex flex-col gap-6 pt-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="text-4xl font-semibold">ምርጥ ሻጮች</h2>
        <Link href="/sellers" className={buttonVariants({ variant: "outline" })}>
          ሁሉንም ሻጮች
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {sellers.map((seller) => (
          <Link
            key={seller.id}
            href={`/accounts?seller=${seller.id}`}
            className="flex flex-col gap-2 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:ring-primary/60"
          >
            <p className="font-semibold">{seller.name}</p>
            <p className="text-sm text-muted-foreground">{seller.deals} ሽያጮች</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="grid items-center gap-6 pt-12 lg:grid-cols-2 lg:pt-20">
        <div className="flex flex-col items-start gap-6">
          <Eyebrow>የአካውንት መገበያያ ለኢትዮጵያ</Eyebrow>
          <h1 className="text-4xl leading-[1.2] font-extrabold sm:text-6xl">
            የሶሻል ሚዲያ አካውንት
            <br />
            <span className="text-gold">ይግዙ፣ ይሽጡ</span>
            <br />
            በአስተማማኝ መንገድ።
          </h1>
          <div className="flex w-full items-center gap-6 border-t border-border pt-6">
            <div className="flex -space-x-2">
              {platforms.map((platform) => (
                <PlatformMark key={platform.id} mark={platform.mark} className="size-10 rounded-full bg-secondary" />
              ))}
            </div>
            <div>
              <p className="text-xl font-semibold text-primary">{platforms.length} መድረኮች</p>
              <p className="text-sm text-muted-foreground">በአንድ ገበያ</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/accounts"
              aria-label="ወደ ገበያው ይሂዱ"
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
            >
              <ArrowUpRightIcon className="size-7" />
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              ከInstagram እስከ Telegram ያሉ አካውንቶችን ያስሱ፣ ያወዳድሩ እና ደረጃ በደረጃ በሚታይ ሂደት ይግዙ።
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/accounts" className={buttonVariants({ size: "lg" })}>
              ገበያውን ይመልከቱ
            </Link>
            <Link href="/sell" className={buttonVariants({ size: "lg", variant: "outline" })}>
              አካውንት ይሽጡ
            </Link>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section aria-labelledby="platforms-heading" className="flex flex-col gap-6 pt-16">
        <h2 id="platforms-heading" className="sr-only">
          መድረኮች
        </h2>
        <Suspense fallback={<Skeleton className="h-36 rounded-xl" />}>
          <PlatformTiles />
        </Suspense>
      </section>

      <section className="flex flex-col gap-12 pt-24">
        <div className="grid items-end gap-6 lg:grid-cols-2">
          <h2 className="text-4xl leading-tight font-semibold">
            ለ<span className="text-gold">ግዢ እና ሽያጭ</span>
            <br />
            ግልጽ የሆነ ሂደት።
          </h2>
          <p className="max-w-lg text-muted-foreground lg:justify-self-end">
            ማስታወቂያ ከመውጣቱ እስከ ትዕዛዝ መጠናቀቅ ድረስ እያንዳንዱ ደረጃ ለሁለቱም ወገኖች ግልጽ እንዲሆን የተዘጋጀ ነው።
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
                <h3 className="text-xl font-semibold">{pillar.title}</h3>
                <p className={highlighted ? "text-sm" : "text-sm text-muted-foreground"}>{pillar.description}</p>
                {pillar.href ? (
                  <Link href={pillar.href} className="flex items-center gap-2 text-sm font-semibold hover:underline">
                    ተጨማሪ ይወቁ
                    <ArrowRightIcon className="size-4" />
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-4xl font-semibold">
            <span className="text-gold">አዳዲስ</span> አካውንቶች
          </h2>
          <Link href="/accounts" className={buttonVariants({ variant: "outline" })}>
            ሁሉንም ይመልከቱ
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
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
          በፍጥነት <span className="text-gold">ያግኙ</span>
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <QuickFilter
            title="በዘርፍ"
            items={categories.map((category) => ({ href: `/accounts?category=${category.value}`, label: category.label }))}
          />
          <QuickFilter
            title="በተከታይ ብዛት"
            items={followerRanges.map((range) => ({ href: `/accounts?followers=${range.value}`, label: range.label }))}
          />
          <QuickFilter
            title="በዋጋ"
            items={priceRanges.map((range) => ({ href: `/accounts?price=${range.value}`, label: range.label }))}
          />
        </div>
      </section>

      <section className="grid items-center gap-12 pt-24 lg:grid-cols-2">
        <div className="relative flex flex-col gap-6">
          <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardDescription>የተከታዮች ዕድገት</CardDescription>
              <CardTitle className="text-2xl font-semibold">{formatCount(illustrationGrowth[illustrationGrowth.length - 1])}</CardTitle>
            </CardHeader>
            <div className="px-6">
              <GrowthChart values={illustrationGrowth} />
            </div>
          </Card>
          <SampleNotice />
        </div>
        <div className="flex flex-col items-start gap-6">
          <h2 className="text-4xl leading-tight font-semibold">
            ከመግዛትዎ በፊት
            <br />
            <span className="text-gold">ቁጥሮቹን</span> ይመልከቱ።
          </h2>
          <p className="text-muted-foreground">
            እያንዳንዱ ማስታወቂያ ተከታዮችን፣ ተሳትፎን፣ የአድማጮችን ስብጥር እና የሻጩን ታሪክ ያሳያል። አካውንቶችን ጎን ለጎን ማወዳደርም ይችላሉ።
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/compare" className={buttonVariants({ size: "lg" })}>
              አካውንቶችን ያወዳድሩ
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <Link href="/faq" className={buttonVariants({ size: "lg", variant: "ghost" })}>
              ጥያቄ አለዎት?
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 pt-24">
        <h2 className="text-4xl font-semibold">
          እንዴት <span className="text-gold">ይሰራል?</span>
        </h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <span className="text-xl font-semibold text-primary">0{index + 1}.</span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
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
            <h2 className="text-3xl font-semibold">አካውንት አለዎት?</h2>
            <p>ማስታወቂያዎን በጥቂት ደረጃዎች ያዘጋጁ።</p>
          </div>
          <Link href="/sell" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            መሸጥ ይጀምሩ
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
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
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl bg-secondary px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
