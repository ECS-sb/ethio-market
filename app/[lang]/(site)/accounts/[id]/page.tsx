import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeftIcon, BadgeCheckIcon } from "lucide-react";
import { PlatformMark } from "@/components/brand";
import { LocaleLink } from "@/components/i18n-provider";
import { ListingActions } from "@/components/listing-actions";
import { ListingCard } from "@/components/listing-card";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { categories, countries, formatCount, formatPrice, getPlatform, howItWorksSteps, labelOf, listingStatusLabels } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getListingForViewer, getSellerDealCount, getSimilarListings } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export const generateMetadata = pageTitle("Account details");

type Props = { params: Promise<{ id: string }> };

async function ListingContent({ params }: Props) {
  await connection();
  const t = await getT();
  const { id } = await params;
  const viewer = await getCurrentUser();
  const found = await getListingForViewer(id, viewer);
  if (!found) notFound();

  const { listing, isOwner } = found;
  const platform = getPlatform(listing.platform);
  const [similar, sellerDeals] = await Promise.all([getSimilarListings(listing), getSellerDealCount(listing.sellerId)]);

  const stats = [
    { label: t(platform?.unit ?? "Followers"), value: formatCount(listing.followers) },
    { label: t("Posts"), value: listing.posts === null ? "—" : formatCount(listing.posts) },
    { label: t("Engagement"), value: listing.engagement === null ? "—" : `${listing.engagement}%` },
    { label: t("Year created"), value: listing.joinedYear === null ? "—" : String(listing.joinedYear) },
  ];
  const details = [
    { label: t("Category"), value: t(labelOf(categories, listing.category)) },
    { label: t("Main country"), value: t(labelOf(countries, listing.country)) },
    { label: t("Original email"), value: listing.originalEmail ? t("Included") : t("Not included") },
    { label: t("Status"), value: t(listingStatusLabels[listing.status]) },
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
                {listing.special ? "" : ` · ${t("The full username is shown after payment is confirmed")}`}
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

          {listing.monetized || listing.strikeFree || listing.noAdsense ? (
            <div className="flex flex-wrap gap-2">
              {listing.monetized ? <Badge>{t("Monetized")}</Badge> : null}
              {listing.strikeFree ? <Badge variant="secondary">{t("Strike and copyright free")}</Badge> : null}
              {listing.noAdsense ? <Badge variant="secondary">{t("Without AdSense")}</Badge> : null}
            </div>
          ) : null}

          {listing.images.length > 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">{t("Channel screenshots")}</h2>
              <ScreenshotGallery images={listing.images} />
              <p className="text-xs text-muted-foreground">{t("Screenshots come from the seller. Check the numbers again during the handover.")}</p>
            </section>
          ) : null}

          {listing.description ? (
            <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle>{t("Description")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm break-words whitespace-pre-line text-muted-foreground">{listing.description}</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
              <CardHeader>
                <CardTitle>{t("Account details")}</CardTitle>
                <CardDescription>{t("These details come from the seller.")}</CardDescription>
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
                  <CardTitle>{t("Audience")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 text-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("Women")}</span>
                      <span>{listing.femaleShare}%</span>
                    </div>
                    <Progress value={listing.femaleShare} aria-label={t("Share of women")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("Men")}</span>
                      <span>{100 - listing.femaleShare}%</span>
                    </div>
                    <Progress value={100 - listing.femaleShare} aria-label={t("Share of men")} />
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle>{t("How buying works")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-6 sm:grid-cols-2">
                {howItWorksSteps.map((step, index) => (
                  <li key={step.title} className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">
                      <span className="text-primary">{index + 1}.</span> {t(step.title)}
                    </p>
                    <p className="text-sm text-muted-foreground">{t(step.description)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardDescription>{t("Price")}</CardDescription>
              <CardTitle className="text-3xl font-semibold">{formatPrice(t, listing.priceEtb)}</CardTitle>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <div className="flex flex-col gap-4">
                  <Badge variant="outline">{t(listingStatusLabels[listing.status])}</Badge>
                  <p className="text-sm text-muted-foreground">{t("This is your listing.")}</p>
                  <LocaleLink href="/dashboard/seller" className={buttonVariants({ variant: "outline" })}>
                    {t("Go to seller dashboard")}
                  </LocaleLink>
                </div>
              ) : listing.status !== "APPROVED" ? (
                <div className="flex flex-col gap-4">
                  <Badge variant="outline">{t(listingStatusLabels[listing.status])}</Badge>
                  <p className="text-sm text-muted-foreground">{t("This account isn't available to buy right now.")}</p>
                  <LocaleLink href="/accounts" className={buttonVariants({ variant: "outline" })}>
                    {t("See other accounts")}
                  </LocaleLink>
                </div>
              ) : viewer ? (
                <ListingActions id={listing.id} price={listing.priceEtb} canOffer />
              ) : (
                <LocaleLink
                  href={`/login?next=${encodeURIComponent(`/accounts/${listing.id}`)}`}
                  className={buttonVariants({ size: "lg", className: "w-full" })}
                >
                  {t("Sign in to buy")}
                </LocaleLink>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardDescription>{t("Seller")}</CardDescription>
              <CardTitle className="flex items-center gap-2">
                {listing.sellerName}
                {listing.sellerVerified ? <BadgeCheckIcon aria-label={t("Verified seller")} className="size-4 text-primary" /> : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Sales")}</dt>
                  <dd className="font-semibold">{sellerDeals}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Member since")}</dt>
                  <dd className="font-semibold">{listing.sellerSince}</dd>
                </div>
              </dl>
              <LocaleLink href={`/accounts?seller=${listing.sellerId}`} className={buttonVariants({ variant: "outline" })}>
                {t("Seller's accounts")}
              </LocaleLink>
            </CardContent>
          </Card>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="flex flex-col gap-6 pt-12">
          <h2 className="text-3xl font-semibold">
            <span className="text-gold">{t("Similar")}</span> {t("accounts")}
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

export default async function ListingPage({ params }: Props) {
  const t = await getT();
  return (
    <div className="flex flex-col gap-6 pt-12">
      <LocaleLink href="/accounts" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        {t("Back to the market")}
      </LocaleLink>
      <Suspense fallback={<Skeleton className="h-[32rem] rounded-xl" />}>
        <ListingContent params={params} />
      </Suspense>
    </div>
  );
}
