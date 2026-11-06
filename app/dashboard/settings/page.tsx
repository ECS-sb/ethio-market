import type { Metadata } from "next";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/lib/actions";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "ቅንብሮች" };

export default async function SettingsPage() {
  const user = await requireUser("/dashboard/settings");

  return (
    <>
      <h1 className="text-3xl font-semibold">ቅንብሮች</h1>
      <ActionForm action={updateProfileAction} className="flex max-w-2xl flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">ስም (ከGoogle)</Label>
            <Input id="name" value={user.name} disabled readOnly />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">ኢሜይል (ከGoogle)</Label>
            <Input id="email" value={user.email} disabled readOnly dir="ltr" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">ስልክ</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} maxLength={20} autoComplete="tel" dir="ltr" />
            <p className="text-xs text-muted-foreground">ለአስተዳዳሪው ብቻ ይታያል።</p>
          </div>
        </div>
        <SubmitButton className="w-fit">አስቀምጥ</SubmitButton>
      </ActionForm>
    </>
  );
}
