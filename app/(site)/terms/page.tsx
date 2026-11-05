import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "የአገልግሎት ውል" };

export default function TermsPage() {
  return (
    <LegalPage
      title="የአገልግሎት ውል"
      sections={[
        { heading: "መሸፈን ያለባቸው ጉዳዮች", items: ["የመጠቀም ብቁነት እና የመለያ ኃላፊነት", "የክፍያ፣ የኮሚሽን እና የተመላሽ ገንዘብ ሁኔታዎች", "የክርክር አፈታት እና ተፈጻሚ ሕግ", "የመድረኮች ደንብ እና የተጠቃሚው ኃላፊነት"] },
      ]}
    />
  );
}
