import { Suspense } from "react";
import { PageIntro } from "@/components/brand";
import { LocaleLink } from "@/components/i18n-provider";
import { SellWizard } from "@/components/sell-wizard";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getT, pageTitle } from "@/lib/i18n-server";
import type { MessageKey } from "@/lib/messages";
import { getCurrentUser } from "@/lib/session";

export const generateMetadata = pageTitle("Sell an account");

const benefits: { title: MessageKey; description: MessageKey }[] = [
  { title: "Prove ownership", description: "Put the code in the account's bio to show the account is yours." },
  { title: "Decide on offers", description: "You accept or decline the offers you receive. It's your call." },
  { title: "Completed after handover", description: "When the buyer confirms the handover, an admin completes the order." },
];

async function SellGate() {
  const t = await getT();
  const user = await getCurrentUser();
  if (!user || user.suspended) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <p className="font-semibold">{t("Sign in to post a listing")}</p>
        <LocaleLink href="/login?next=%2Fsell" className={buttonVariants({ size: "lg" })}>
          {t("Sign in with Google")}
        </LocaleLink>
      </div>
    );
  }
  return <SellWizard />;
}

export default async function SellPage() {
  const t = await getT();
  return (
    <>
      <PageIntro
        eyebrow={t("For sellers")}
        title={
          <>
            {t("List your account")} <span className="text-gold">{t("in a few steps.")}</span>
          </>
        }
        description={t("Before listing, check that the platform's rules allow transferring accounts.")}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <SellGate />
        </Suspense>
        <aside className="flex flex-col gap-6">
          {benefits.map((benefit, index) => (
            <div key={benefit.title} className="flex flex-col gap-2 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <p className="font-semibold text-primary">0{index + 1}.</p>
              <h2 className="font-semibold">{t(benefit.title)}</h2>
              <p className="text-sm text-muted-foreground">{t(benefit.description)}</p>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
