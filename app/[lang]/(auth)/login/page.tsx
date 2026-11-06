import { Suspense } from "react";
import { redirect } from "next/navigation";
import { GoogleSignIn } from "@/components/google-sign-in";
import { LocaleLink } from "@/components/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { localePath } from "@/lib/i18n";
import { getLocale, getT, pageTitle } from "@/lib/i18n-server";
import { getCurrentUser, safeNextPath } from "@/lib/session";

export const generateMetadata = pageTitle("Sign in");

type Params = Promise<Record<string, string | string[] | undefined>>;

async function LoginContent({ searchParams }: { searchParams: Params }) {
  const t = await getT();
  const locale = await getLocale();
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const suspended = params.error === "suspended";
  const user = await getCurrentUser();
  if (user && !user.suspended && !suspended) redirect(localePath(locale, next));

  return (
    <div className="flex flex-col gap-6">
      {suspended || user?.suspended ? (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {t("This account has been suspended. Contact us for more information.")}
        </p>
      ) : null}
      <GoogleSignIn next={next} />
    </div>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Params }) {
  const t = await getT();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("Welcome")}</h1>
        <p className="text-sm text-muted-foreground">{t("Sign in or sign up with your Gmail account.")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-12 rounded-xl" />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
      <p className="text-center text-xs text-muted-foreground">
        {t("By continuing, you accept the")}{" "}
        <LocaleLink href="/terms" className="underline hover:text-foreground">
          {t("Terms of service")}
        </LocaleLink>{" "}
        {t("and the")}{" "}
        <LocaleLink href="/privacy" className="underline hover:text-foreground">
          {t("Privacy policy")}
        </LocaleLink>
        .
      </p>
    </div>
  );
}
