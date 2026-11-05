import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "የገዢ እና የሻጭ ደንቦች" };

export default function RulesPage() {
  return (
    <LegalPage
      title="የገዢ እና የሻጭ ደንቦች"
      sections={[
        {
          heading: "ለገዢዎች",
          items: [
            "ከመግዛትዎ በፊት የአካውንቱን መረጃ እና የመድረኩን ደንብ ይገምግሙ።",
            "ክፍያን ከEscrow ውጭ አይፈጽሙ።",
            "ርክክቡ ከማለቁ በፊት ርክክብ መጠናቀቁን አያረጋግጡ።",
          ],
        },
        {
          heading: "ለሻጮች",
          items: [
            "የራስዎን አካውንት ብቻ ይሽጡ፣ ባለቤትነትዎንም ያረጋግጡ።",
            "የተከታይ ቁጥር እና ሌላ መረጃ በትክክል ያቅርቡ።",
            "የተሰረቁ ወይም በሐሰት የተገኙ አካውንቶች አይፈቀዱም።",
          ],
        },
      ]}
    />
  );
}
