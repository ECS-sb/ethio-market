import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, BadgeCheckIcon } from "lucide-react";
import { PlatformMark, SampleNotice } from "@/components/brand";
import { GrowthChart } from "@/components/growth-chart";
import { ListingActions } from "@/components/listing-actions";
import { ListingCard } from "@/components/listing-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  activeListings,
  categories,
  countries,
  formatCount,
  formatPrice,
  getListing,
  getPlatform,
  getSeller,
  howItWorksSteps,
  labelOf,
  listings,
  statusLabels,
} from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return listings.map((listing) => ({ id: listing.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = getListing(id);
  return { title: listing ? `@${listing.handle}` : "አልተገኘም" };
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const platform = getPlatform(listing.platform);
  const seller = getSeller(listing.sellerId);
  const similar = activeListings
    .filter((item) => item.id !== listing.id && item.status === "available" && (item.category === listing.category || item.platform === listing.platform))
    .slice(0, 3);

  const stats = [
    { label: platform?.unit ?? "ተከታዮች", value: formatCount(listing.followers) },
    { label: "ልጥፎች", value: formatCount(listing.posts) },
    { label: "ተሳትፎ", value: `${listing.engagement}%` },
    { label: "የተከፈተበት ዓመት", value: String(listing.joinedYear) },
  ];

  const details = [
    { label: "ዘርፍ", value: labelOf(categories, listing.category) },
    { label: "ዋና ሀገር", value: labelOf(countries, listing.country) },
    { label: "የመጀመሪያ ኢሜይል", value: listing.originalEmail ? "ይካተታል" : "አይካተትም" },
    { label: "ሁኔታ", value: statusLabels[listing.status] },
  ];

  return (
    <div className="flex flex-col gap-6 pt-12">
      <Link href="/accounts" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        ወደ ገበያው ተመለስ
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex items-center gap-4">
            <PlatformMark mark={platform?.mark ?? ""} className="size-14" />
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="truncate text-3xl font-semibold" dir="ltr">
                @{listing.handle}
              </h1>
              <p className="text-sm text-muted-foreground">{platform?.name} · ሙሉ ስሙ ከግዢ በኋላ ይታያል</p>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
                <p className="text-2xl font-semibold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle>የተከታዮች ዕድገት</CardTitle>
              <CardDescription>ያለፉት 9 ወራት</CardDescription>
            </CardHeader>
            <CardContent>
              <GrowthChart values={listing.growth} />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle>የአካውንት መረጃ</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="flex flex-col gap-4 text-sm">
                  {details.map((detail) => (
                    <div key={detail.label} className="flex justify-between gap-6">
                      <dt className="text-muted-foreground">{detail.label}</dt>
                      <dd className="text-right font-medium">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
            <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle>የአድማጮች ስብጥር</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 text-sm">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ሴቶች</span>
                    <span>{listing.femaleShare}%</span>
                  </div>
                  <Progress value={listing.femaleShare} aria-label="የሴቶች ድርሻ" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ወንዶች</span>
                    <span>{100 - listing.femaleShare}%</span>
                  </div>
                  <Progress value={100 - listing.femaleShare} aria-label="የወንዶች ድርሻ" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle>የግዢ ሂደት</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-6 sm:grid-cols-2">
                {howItWorksSteps.map((step, index) => (
                  <li key={step.title} className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">
                      <span className="text-primary">{index + 1}.</span> {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardDescription>ዋጋ</CardDescription>
              <CardTitle className="text-3xl font-semibold">{formatPrice(listing.price)}</CardTitle>
            </CardHeader>
            <CardContent>
              {listing.status === "available" ? (
                <ListingActions id={listing.id} price={listing.price} />
              ) : (
                <div className="flex flex-col gap-4">
                  <Badge variant="outline">{statusLabels[listing.status]}</Badge>
                  <p className="text-sm text-muted-foreground">ይህ አካውንት አሁን ለግዢ ክፍት አይደለም።</p>
                  <Link href="/accounts" className={buttonVariants({ variant: "outline" })}>
                    ሌሎች አካውንቶችን ይመልከቱ
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {seller ? (
            <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardDescription>ሻጭ</CardDescription>
                <CardTitle className="flex items-center gap-2">
                  {seller.name}
                  {seller.verified ? <BadgeCheckIcon aria-label="የተረጋገጠ ሻጭ" className="size-4 text-primary" /> : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <dl className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">ደረጃ</dt>
                    <dd className="font-semibold">★ {seller.rating}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">ሽያጮች</dt>
                    <dd className="font-semibold">{seller.deals}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">አባል ከ</dt>
                    <dd className="font-semibold">{seller.joinedYear}</dd>
                  </div>
                </dl>
                <Link href={`/accounts?seller=${seller.id}`} className={buttonVariants({ variant: "outline" })}>
                  የሻጩን አካውንቶች
                </Link>
              </CardContent>
            </Card>
          ) : null}
          <SampleNotice />
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="flex flex-col gap-6 pt-12">
          <h2 className="text-3xl font-semibold">
            <span className="text-gold">ተመሳሳይ</span> አካውንቶች
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
