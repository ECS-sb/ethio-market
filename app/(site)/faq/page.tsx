import type { Metadata } from "next";
import { PageIntro } from "@/components/brand";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/lib/data";

export const metadata: Metadata = { title: "ተደጋጋሚ ጥያቄዎች" };

export default function FaqPage() {
  return (
    <>
      <PageIntro
        eyebrow="እርዳታ"
        title={
          <>
            ተደጋጋሚ <span className="text-gold">ጥያቄዎች</span>
          </>
        }
      />
      <div className="max-w-3xl rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <Accordion>
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
