import { PageIntro } from "@/components/brand";
import { CompareTable } from "@/components/compare-table";
import { getT, pageTitle } from "@/lib/i18n-server";

export const generateMetadata = pageTitle("Compare");

export default async function ComparePage() {
  const t = await getT();
  return (
    <>
      <PageIntro
        eyebrow={t("Compare")}
        title={
          <>
            {t("See accounts")} <span className="text-gold">{t("side by side.")}</span>
          </>
        }
        description={t("You can choose up to four accounts.")}
      />
      <CompareTable />
    </>
  );
}
