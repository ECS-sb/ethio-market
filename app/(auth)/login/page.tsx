import type { Metadata } from "next";
import Link from "next/link";
import { DemoForm } from "@/components/demo-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "ይግቡ" };

export default function LoginPage() {
  return (
    <DemoForm message="መግቢያው ገና አልተገናኘም። ዳሽቦርዱን በናሙና መረጃ ማየት ይችላሉ።" className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">እንኳን ደህና መጡ</h1>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">ኢሜይል</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" dir="ltr" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">የይለፍ ቃል</Label>
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            ረስተዋል?
          </Link>
        </div>
        <Input id="password" name="password" type="password" required autoComplete="current-password" dir="ltr" />
      </div>
      <Button type="submit" size="lg">
        ይግቡ
      </Button>
      <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "lg" })}>
        ዳሽቦርዱን በናሙና ይመልከቱ
      </Link>
      <p className="text-center text-sm text-muted-foreground">
        መለያ የለዎትም?{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          ይመዝገቡ
        </Link>
      </p>
    </DemoForm>
  );
}
