import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "የግላዊነት ፖሊሲ" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="የግላዊነት ፖሊሲ"
      sections={[
        { heading: "መሸፈን ያለባቸው ጉዳዮች", items: ["የሚሰበሰብ መረጃ እና ዓላማው", "የመረጃ ማከማቻ ጊዜ እና ጥበቃ", "ለሦስተኛ ወገን የሚሰጥ መረጃ", "የተጠቃሚ መብቶች እና የመገናኛ መንገድ"] },
      ]}
    />
  );
}
