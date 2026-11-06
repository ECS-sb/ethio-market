import { PageIntro } from "@/components/brand";
import { getT, pageTitle } from "@/lib/i18n-server";
import type { MessageKey } from "@/lib/messages";

export const generateMetadata = pageTitle("About us");

const values: { title: MessageKey; description: MessageKey }[] = [
  { title: "Transparency", description: "Buyers should see the information they need before deciding." },
  { title: "Step-by-step orders", description: "Each order is tracked from payment confirmation to handover." },
  { title: "Accountability", description: "Sellers prove ownership, and their history is visible to buyers." },
];

export default async function AboutPage() {
  const t = await getT();
  return (
    <>
      <PageIntro
        eyebrow={t("About us")}
        title={
          <>
            {t("Why")} <span className="text-gold">Ethio Market?</span>
          </>
        }
        description={t("Ethio Market is a marketplace for buying and selling social media accounts.")}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="flex flex-col gap-2 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <h2 className="text-xl font-semibold">{t(value.title)}</h2>
            <p className="text-sm text-muted-foreground">{t(value.description)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
