import { PageIntro } from "@/components/brand";
import { LocaleLink } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { howItWorksSteps, orderStages, orderStatusLabels } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";

export const generateMetadata = pageTitle("How it works");

export default async function HowItWorksPage() {
  const t = await getT();
  return (
    <>
      <PageIntro
        eyebrow={t("The process")}
        title={
          <>
            {t("From listing to")} <span className="text-gold">{t("handover.")}</span>
          </>
        }
        description={t("A process where both buyer and seller can see every step.")}
      />
      <ol className="grid gap-6 md:grid-cols-2">
        {howItWorksSteps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <span className="text-3xl font-semibold text-primary">0{index + 1}.</span>
            <h2 className="text-xl font-semibold">{t(step.title)}</h2>
            <p className="text-muted-foreground">{t(step.description)}</p>
          </li>
        ))}
      </ol>
      <section className="flex flex-col gap-6 pt-12">
        <h2 className="text-3xl font-semibold">
          <span className="text-gold">{t("Order")}</span> {t("stages")}
        </h2>
        <ol className="flex flex-col gap-4 md:flex-row">
          {orderStages.map((stage, index) => (
            <li key={stage} className="flex flex-1 items-center gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <span className="text-sm">{t(orderStatusLabels[stage])}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="flex flex-wrap gap-2 pt-6">
        <LocaleLink href="/accounts" className={buttonVariants({ size: "lg" })}>
          {t("Browse the market")}
        </LocaleLink>
        <LocaleLink href="/sell" className={buttonVariants({ size: "lg", variant: "outline" })}>
          {t("Sell an account")}
        </LocaleLink>
      </div>
    </>
  );
}
