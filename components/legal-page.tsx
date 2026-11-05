import { PageIntro } from "@/components/brand";

export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: { heading: string; items: string[] }[];
}) {
  return (
    <>
      <PageIntro eyebrow="ረቂቅ" title={title} />
      <p className="max-w-3xl rounded-xl bg-primary/15 p-6 text-sm ring-1 ring-primary/30">
        ይህ ለማሳያ የተዘጋጀ ረቂቅ ነው፤ ሕጋዊ ሰነድ አይደለም። ድረ-ገጹ ከመከፈቱ በፊት በሕግ ባለሙያ መዘጋጀት አለበት።
      </p>
      <div className="flex max-w-3xl flex-col gap-6">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            <ul className="flex list-disc flex-col gap-2 pl-6 text-sm text-muted-foreground">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
