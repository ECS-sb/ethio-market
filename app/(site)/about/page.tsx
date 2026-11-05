import type { Metadata } from "next";
import { PageIntro } from "@/components/brand";

export const metadata: Metadata = { title: "ስለ እኛ" };

const values = [
  { title: "ግልጽነት", description: "ገዢው ከመወሰኑ በፊት አስፈላጊውን መረጃ ማየት አለበት።" },
  { title: "የተጠበቀ ክፍያ", description: "ርክክቡ እስኪረጋገጥ ገንዘቡ ለሻጩ አይለቀቅም።" },
  { title: "ተጠያቂነት", description: "ሻጮች ባለቤትነታቸውን ያረጋግጣሉ፣ ታሪካቸውም ለገዢዎች ይታያል።" },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="ስለ እኛ"
        title={
          <>
            Ethio Market <span className="text-gold">ለምን?</span>
          </>
        }
        description="Ethio Market የሶሻል ሚዲያ አካውንቶችን ለመግዛት እና ለመሸጥ የሚያስችል ገበያ ነው።"
      />
      <div className="grid gap-6 md:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="flex flex-col gap-2 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <h2 className="text-xl font-semibold">{value.title}</h2>
            <p className="text-sm text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
