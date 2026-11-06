import { ActionForm, SubmitButton } from "@/components/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/lib/actions";
import { getT, pageTitle } from "@/lib/i18n-server";
import { requireUser } from "@/lib/session";

export const generateMetadata = pageTitle("Settings");

export default async function SettingsPage() {
  const t = await getT();
  const user = await requireUser("/dashboard/settings");

  return (
    <>
      <h1 className="text-3xl font-semibold">{t("Settings")}</h1>
      <ActionForm action={updateProfileAction} className="flex max-w-2xl flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t("Name (from Google)")}</Label>
            <Input id="name" value={user.name} disabled readOnly />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("Email (from Google)")}</Label>
            <Input id="email" value={user.email} disabled readOnly dir="ltr" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">{t("Phone")}</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} maxLength={20} autoComplete="tel" dir="ltr" />
            <p className="text-xs text-muted-foreground">{t("Only visible to admins.")}</p>
          </div>
        </div>
        <SubmitButton className="w-fit">{t("Save")}</SubmitButton>
      </ActionForm>
    </>
  );
}
