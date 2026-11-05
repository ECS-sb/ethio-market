import type { Metadata } from "next";
import Link from "next/link";
import { DemoForm } from "@/components/demo-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "የይለፍ ቃል ማስመለሻ" };

export default function ForgotPasswordPage() {
  return (
    <DemoForm message="ይህ ማሳያ ነው፤ ኢሜይል አልተላከም።" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">የይለፍ ቃል ማስመለሻ</h1>
        <p className="text-sm text-muted-foreground">ኢሜይልዎን ያስገቡ።</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">ኢሜይል</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" dir="ltr" />
      </div>
      <Button type="submit" size="lg">
        ሊንክ ላክ
      </Button>
      <Link href="/login" className="text-center text-sm text-muted-foreground hover:text-foreground">
        ወደ መግቢያ ተመለስ
      </Link>
    </DemoForm>
  );
}
