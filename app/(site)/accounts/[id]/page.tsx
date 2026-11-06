import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeftIcon, BadgeCheckIcon } from "lucide-react";
import { PlatformMark } from "@/components/brand";
import { ListingActions } from "@/components/listing-actions";
import { ListingCard } from "@/components/listing-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { categories, countries, formatCount, formatPrice, getPlatform, howItWorksSteps, labelOf, listingStatusLabels } from "@/lib/catalog";
import { getListingForViewer, getSellerDealCount, getSimilarListings } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "የአካውንት ዝርዝር" };

type Props = { params: Promise<{ id: string }> };

async function ListingContent({ params }: Props) {
  await connection();
  const { id } = await params;
  const viewer = await getCurrentUser();
  const found = await getListingForViewer(id, viewer);
  if (!found) notFound();

  const { listing, isOwner } = found;
  const platform = getPlatform(listing.platform);
  const [similar, sellerDeals] = await Promise.all([getSimilarListings(listing), getSellerDealCount(listing.sellerId)]);

  const stats = [
    { label: platform?.unit ?? "ተከታዮች", value: formatCount(listing.followers) },
    { label: "ልጥፎች", value: listing.posts === null ? "—" : formatCount(listing.posts) },
    { label: "ተሳትፎ", value: listing.engagement === null ? "—" : `${listing.engagement}%` },
    { label: "የተከፈተበት ዓመት", value: listing.joinedYear === null ? "—" : String(listing.joinedYear) },
  ];
  const details = [
    { label: "ዘርፍ", value: labelOf(categories, listing.category) },
    { label: "ዋና ሀገር", value: labelOf(countries, listing.country) },
    { label: "የመጀመሪያ ኢሜይል", value: listing.originalEmail ? "ይካተታል" : "አይካተትም" },
    { label: "ሁኔታ", value: listingStatusLabels[listing.status] },
  ];

  return (
    <>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex items-center gap-4">
            <PlatformMark mark={platform?.mark ?? ""} className="size-14" />
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="truncate text-3xl font-semibold" dir="ltr">
                @{listing.handle}
              </h1>
              <p className="text-sm text-muted-foreground">
                {platform?.name}
                {listing.special ? "" : " · ሙሉ ስሙ ክፍያ ከተረጋገጠ በኋላ ይታያል"}
              </p>
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

          {listing.description ? (
            <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle>መግለጫ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm break-words whitespace-pre-line text-muted-foreground">{listing.description}</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle>የአካውንት መረጃ</CardTitle>
                <CardDescription>መረጃው በሻጩ የቀረበ ነው።</CardDescription>
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
            {listing.femaleShare !== null ? (
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
            ) : null}
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
              <CardTitle className="text-3xl font-semibold">{formatPrice(listing.priceEtb)}</CardTitle>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <div className="flex flex-col gap-4">
                  <Badge variant="outline">{listingStatusLabels[listing.status]}</Badge>
                  <p className="text-sm text-muted-foreground">ይህ የእርስዎ ማስታወቂያ ነው።</p>
                  <Link href="/dashboard/seller" className={buttonVariants({ variant: "outline" })}>
                    ወደ ሻጭ ዳሽቦርድ
                  </Link>
                </div>
              ) : listing.status !== "APPROVED" ? (
                <div className="flex flex-col gap-4">
                  <Badge variant="outline">{listingStatusLabels[listing.status]}</Badge>
                  <p className="text-sm text-muted-foreground">ይህ አካውንት አሁን ለግዢ ክፍት አይደለም።</p>
                  <Link href="/accounts" className={buttonVariants({ variant: "outline" })}>
                    ሌሎች አካውንቶችን ይመልከቱ
                  </Link>
                </div>
              ) : viewer ? (
                <ListingActions id={listing.id} price={listing.priceEtb} canOffer />
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(`/accounts/${listing.id}`)}`}
                  className={buttonVariants({ size: "lg", className: "w-full" })}
                >
                  ለመግዛት ይግቡ
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardDescription>ሻጭ</CardDescription>
              <CardTitle className="flex items-center gap-2">
                {listing.sellerName}
                {listing.sellerVerified ? <BadgeCheckIcon aria-label="የተረጋገጠ ሻጭ" className="size-4 text-primary" /> : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">ሽያጮች</dt>
                  <dd className="font-semibold">{sellerDeals}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">አባል ከ</dt>
                  <dd className="font-semibold">{listing.sellerSince}</dd>
                </div>
              </dl>
              <Link href={`/accounts?seller=${listing.sellerId}`} className={buttonVariants({ variant: "outline" })}>
                የሻጩን አካውንቶች
              </Link>
            </CardContent>
          </Card>
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
    </>
  );
}

export default function ListingPage({ params }: Props) {
  return (
    <div className="flex flex-col gap-6 pt-12">
      <Link href="/accounts" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        ወደ ገበያው ተመለስ
      </Link>
      <Suspense fallback={<Skeleton className="h-[32rem] rounded-xl" />}>
        <ListingContent params={params} />
      </Suspense>
    </div>
  );
}
