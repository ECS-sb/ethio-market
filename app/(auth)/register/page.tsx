import type { Metadata } from "next";
import Link from "next/link";
import { DemoForm } from "@/components/demo-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "ይመዝገቡ" };

export default function RegisterPage() {
  return (
    <DemoForm message="ምዝገባው ገና አልተገናኘም፤ መለያ አልተፈጠረም።" className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">መለያ ይፍጠሩ</h1>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">ሙሉ ስም</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">ኢሜይል</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" dir="ltr" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">የይለፍ ቃል</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" dir="ltr" />
        <p className="text-xs text-muted-foreground">ቢያንስ 8 ቁምፊዎች።</p>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="terms" name="terms" required />
        <Label htmlFor="terms" className="leading-relaxed font-normal">
          <span>
            <Link href="/terms" className="underline">
              የአገልግሎት ውሉን
            </Link>{" "}
            እና{" "}
            <Link href="/privacy" className="underline">
              የግላዊነት ፖሊሲውን
            </Link>{" "}
            እቀበላለሁ።
          </span>
        </Label>
      </div>
      <Button type="submit" size="lg">
        መለያ ፍጠር
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        መለያ አለዎት?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          ይግቡ
        </Link>
      </p>
    </DemoForm>
  );
}
