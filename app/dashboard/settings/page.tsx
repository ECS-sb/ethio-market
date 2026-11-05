import type { Metadata } from "next";
import { DemoForm } from "@/components/demo-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "ቅንብሮች" };

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">ቅንብሮች</h1>
      <DemoForm message="ይህ ማሳያ ነው፤ ለውጦቹ አልተቀመጡም።" className="flex max-w-2xl flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <h2 className="text-xl font-semibold">መገለጫ</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">ሙሉ ስም</Label>
            <Input id="name" name="name" autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">ኢሜይል</Label>
            <Input id="email" name="email" type="email" autoComplete="email" dir="ltr" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">ስልክ</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" dir="ltr" />
          </div>
        </div>
        <Button type="submit" className="w-fit">
          አስቀምጥ
        </Button>
      </DemoForm>
    </>
  );
}
