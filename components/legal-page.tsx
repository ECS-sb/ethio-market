import { PageIntro } from "@/components/brand";
import { getT } from "@/lib/i18n-server";
import type { MessageKey } from "@/lib/messages";

export async function LegalPage({
  title,
  sections,
}: {
  title: MessageKey;
  sections: { heading: MessageKey; items: MessageKey[] }[];
}) {
  const t = await getT();
  return (
    <>
      <PageIntro eyebrow={t("Draft")} title={t(title)} />
      <p className="max-w-3xl rounded-xl bg-primary/15 p-6 text-sm ring-1 ring-primary/30">
        {t("This is a working draft, not a legal document. It must be prepared by a legal professional before launch.")}
      </p>
      <div className="flex max-w-3xl flex-col gap-6">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <h2 className="text-xl font-semibold">{t(section.heading)}</h2>
            <ul className="flex list-disc flex-col gap-2 pl-6 text-sm text-muted-foreground">
              {section.items.map((item) => (
                <li key={item}>{t(item)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
