import { PageIntro } from "@/components/brand";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";

export const generateMetadata = pageTitle("FAQ");

export default async function FaqPage() {
  const t = await getT();
  return (
    <>
      <PageIntro
        eyebrow={t("Help")}
        title={
          <>
            {t("Frequently asked")} <span className="text-gold">{t("questions")}</span>
          </>
        }
      />
      <div className="max-w-3xl rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <Accordion>
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{t(faq.question)}</AccordionTrigger>
              <AccordionContent>{t(faq.answer)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
