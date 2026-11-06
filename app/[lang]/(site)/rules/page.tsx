import { LegalPage } from "@/components/legal-page";
import { pageTitle } from "@/lib/i18n-server";

export const generateMetadata = pageTitle("Buyer and seller rules");

export default function RulesPage() {
  return (
    <LegalPage
      title="Buyer and seller rules"
      sections={[
        {
          heading: "For buyers",
          items: [
            "Review the account's details and the platform's rules before buying.",
            "Don't make payments outside an admin's instructions.",
            "Don't confirm the handover before it's actually complete.",
          ],
        },
        {
          heading: "For sellers",
          items: [
            "Only sell your own account, and prove that you own it.",
            "Provide accurate follower numbers and other details.",
            "Stolen or fraudulently obtained accounts aren't allowed.",
          ],
        },
      ]}
    />
  );
}
