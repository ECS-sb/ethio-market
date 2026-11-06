import type { Metadata } from "next";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { PageIntro } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createContactAction } from "@/lib/actions";

export const metadata: Metadata = { title: "ያግኙን" };

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="ያግኙን"
        title={
          <>
            እንዴት <span className="text-gold">እንርዳዎት?</span>
          </>
        }
        description="ጥያቄዎን ይጻፉልን።"
      />
      <ActionForm action={createContactAction} className="flex max-w-2xl flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">ስም</Label>
            <Input id="name" name="name" required maxLength={100} autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">ኢሜይል</Label>
            <Input id="email" name="email" type="email" required maxLength={200} autoComplete="email" dir="ltr" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="body">መልዕክት</Label>
          <Textarea id="body" name="body" required maxLength={2000} rows={6} />
        </div>
        <SubmitButton size="lg" className="w-fit">
          መልዕክት ላክ
        </SubmitButton>
      </ActionForm>
    </>
  );
}
