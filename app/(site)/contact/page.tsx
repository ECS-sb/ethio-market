import type { Metadata } from "next";
import { PageIntro } from "@/components/brand";
import { DemoForm } from "@/components/demo-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      <DemoForm
        message="ይህ ማሳያ ነው፤ መልዕክቱ አልተላከም።"
        className="flex max-w-2xl flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">ስም</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">ኢሜይል</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" dir="ltr" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="message">መልዕክት</Label>
          <Textarea id="message" name="message" required rows={6} />
        </div>
        <Button type="submit" size="lg" className="w-fit">
          መልዕክት ላክ
        </Button>
      </DemoForm>
    </>
  );
}
