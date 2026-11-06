import { Suspense } from "react";
import { connection } from "next/server";
import { BadgeCheckIcon } from "lucide-react";
import { PageIntro } from "@/components/brand";
import { LocaleLink } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getTopSellers } from "@/lib/queries";

export const generateMetadata = pageTitle("Sellers");

async function SellersList() {
  await connection();
  const t = await getT();
  const sellers = await getTopSellers();
  if (sellers.length === 0) {
    return (
      <div className="rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <p className="font-semibold">{t("No completed sales yet")}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sellers.map((seller) => (
        <Card key={seller.id} className="bg-card/70 [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {seller.name}
              {seller.verified ? <BadgeCheckIcon aria-label={t("Verified seller")} className="size-4 text-primary" /> : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">{t("Sales")}</dt>
                <dd className="font-semibold text-primary">{seller.deals}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Member since")}</dt>
                <dd className="font-semibold">{seller.since}</dd>
              </div>
            </dl>
            <LocaleLink href={`/accounts?seller=${seller.id}`} className={buttonVariants({ variant: "outline" })}>
              {t("{count} accounts", { count: seller.activeListings })}
            </LocaleLink>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function SellersPage() {
  const t = await getT();
  return (
    <>
      <PageIntro
        eyebrow={t("Sellers")}
        title={
          <>
            {t("Top")} <span className="text-gold">{t("sellers")}</span>
          </>
        }
        description={t("Ranked by completed sales.")}
      />
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <SellersList />
      </Suspense>
    </>
  );
}
