import { LegalPage } from "@/components/legal-page";
import { pageTitle } from "@/lib/i18n-server";

export const generateMetadata = pageTitle("Terms of service");

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      sections={[
        {
          heading: "What this must cover",
          items: [
            "Eligibility and account responsibility",
            "Payment, commission and refund terms",
            "Dispute resolution and governing law",
            "Platform rules and the user's responsibility",
          ],
        },
      ]}
    />
  );
}
