import { LegalPage } from "@/components/legal-page";
import { pageTitle } from "@/lib/i18n-server";

export const generateMetadata = pageTitle("Privacy policy");

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      sections={[
        {
          heading: "What this must cover",
          items: [
            "What data is collected and why",
            "How long data is kept and how it's protected",
            "What data is shared with third parties",
            "User rights and how to reach us",
          ],
        },
      ]}
    />
  );
}
