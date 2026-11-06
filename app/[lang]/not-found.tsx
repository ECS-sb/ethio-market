import { LocaleLink } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
  const t = await getT();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <p className="text-6xl font-semibold text-primary">404</p>
      <h1 className="text-2xl font-semibold">{t("Page not found")}</h1>
      <p className="text-muted-foreground">{t("The page you're looking for doesn't exist or has moved.")}</p>
      <LocaleLink href="/" className={buttonVariants({ size: "lg" })}>
        {t("Back to home")}
      </LocaleLink>
    </main>
  );
}
