"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import { PlatformMark } from "@/components/brand";
import { FieldSelect } from "@/components/field-select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { createListingAction } from "@/lib/actions";
import { categories, countries, formatPrice, getPlatform, labelOf, platforms } from "@/lib/catalog";

const stepTitles = ["መድረክ ይምረጡ", "የአካውንት መረጃ", "ዋጋ እና ማጠቃለያ"];
const USERNAME_PATTERN = /^@?[A-Za-z0-9._-]{1,60}$/;

type Draft = {
  platform: string;
  username: string;
  special: boolean;
  originalEmail: boolean;
  category: string;
  country: string;
  followers: string;
  posts: string;
  engagement: string;
  femaleShare: string;
  joinedYear: string;
  description: string;
  priceEtb: string;
};

const emptyDraft: Draft = {
  platform: "",
  username: "",
  special: false,
  originalEmail: false,
  category: "",
  country: "ET",
  followers: "",
  posts: "",
  engagement: "",
  femaleShare: "",
  joinedYear: "",
  description: "",
  priceEtb: "",
};

export function SellWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [code, setCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  const canContinue = [
    Boolean(draft.platform),
    USERNAME_PATTERN.test(draft.username.trim()) && Boolean(draft.category && draft.country) && Number(draft.followers) >= 0 && draft.followers !== "",
    Number(draft.priceEtb) > 0,
  ][step];

  const submit = () => {
    const data = new FormData();
    for (const [key, value] of Object.entries(draft)) {
      if (typeof value === "boolean") {
        if (value) data.set(key, "on");
      } else {
        data.set(key, value);
      }
    }
    startTransition(async () => {
      const result = await createListingAction(data);
      if (result.ok && result.code) setCode(result.code);
      else toast.error(result.message);
    });
  };

  if (code) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <CheckCircle2Icon className="size-12 text-primary" />
        <h2 className="text-2xl font-semibold">ማስታወቂያው ለግምገማ ተልኳል</h2>
        <p className="max-w-md text-sm text-muted-foreground">ባለቤትነትዎን ለማረጋገጥ ይህን ኮድ በአካውንቱ መግለጫ (bio) ላይ ያስቀምጡ፤ አስተዳዳሪው ካየው በኋላ ማስታወቂያው ይወጣል።</p>
        <code className="rounded-xl bg-secondary px-6 py-4 font-mono text-2xl font-semibold text-primary">{code}</code>
        <p className="text-xs text-muted-foreground">የአካውንቱን የይለፍ ቃል ለማንም አይላኩ።</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDraft(emptyDraft);
              setStep(0);
              setCode(null);
            }}
          >
            ሌላ ማስታወቂያ
          </Button>
          <Link href="/dashboard/seller" className={buttonVariants()}>
            ወደ ሻጭ ዳሽቦርድ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canContinue || pending) return;
        if (step < stepTitles.length - 1) setStep(step + 1);
        else submit();
      }}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          ደረጃ {step + 1} ከ{stepTitles.length}
        </p>
        <h2 className="text-2xl font-semibold">{stepTitles[step]}</h2>
        <Progress value={((step + 1) / stepTitles.length) * 100} aria-label="የሂደት ደረጃ" />
      </div>

      {step === 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3" role="radiogroup" aria-label="መድረክ">
          {platforms.map((platform) => {
            const selected = draft.platform === platform.id;
            return (
              <button
                key={platform.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update({ platform: platform.id })}
                className={`flex items-center gap-4 rounded-xl p-4 text-left text-sm font-medium ring-1 transition-all ${selected ? "bg-primary/15 ring-primary" : "ring-foreground/10 hover:ring-primary/60"}`}
              >
                <PlatformMark mark={platform.mark} />
                {platform.name}
              </button>
            );
          })}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="username">የአካውንቱ ስም</Label>
            <Input id="username" dir="ltr" required placeholder="@username" value={draft.username} onChange={(event) => update({ username: event.target.value })} />
            <p className="text-xs text-muted-foreground">ስሙ ለሕዝብ ተደብቆ ይታያል። የይለፍ ቃል በፍጹም አያስገቡ።</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">ዘርፍ</Label>
            <FieldSelect id="category" value={draft.category} onChange={(value) => update({ category: value })} options={categories} placeholder="ይምረጡ" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="country">የአድማጮች ዋና ሀገር</Label>
            <FieldSelect id="country" value={draft.country} onChange={(value) => update({ country: value })} options={countries} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="followers">የተከታይ ብዛት</Label>
            <Input id="followers" type="number" min={0} required value={draft.followers} onChange={(event) => update({ followers: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="posts">ልጥፎች (አማራጭ)</Label>
            <Input id="posts" type="number" min={0} value={draft.posts} onChange={(event) => update({ posts: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="engagement">ተሳትፎ % (አማራጭ)</Label>
            <Input id="engagement" type="number" min={0} max={100} step="0.1" value={draft.engagement} onChange={(event) => update({ engagement: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="femaleShare">የሴት አድማጮች % (አማራጭ)</Label>
            <Input id="femaleShare" type="number" min={0} max={100} value={draft.femaleShare} onChange={(event) => update({ femaleShare: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="joinedYear">የተከፈተበት ዓመት (አማራጭ)</Label>
            <Input id="joinedYear" type="number" min={2004} value={draft.joinedYear} onChange={(event) => update({ joinedYear: event.target.value })} />
          </div>
          <div className="flex flex-col justify-end gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="originalEmail" checked={draft.originalEmail} onCheckedChange={(checked) => update({ originalEmail: checked === true })} />
              <Label htmlFor="originalEmail">የመጀመሪያው ኢሜይል ይካተታል</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="special" checked={draft.special} onCheckedChange={(checked) => update({ special: checked === true })} />
              <Label htmlFor="special">ልዩ ስም ነው (ስሙ ለሕዝብ ይታያል)</Label>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="description">መግለጫ</Label>
            <Textarea id="description" maxLength={2000} value={draft.description} onChange={(event) => update({ description: event.target.value })} />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="priceEtb">ዋጋ (ብር)</Label>
            <Input id="priceEtb" type="number" min={1} step={1} required value={draft.priceEtb} onChange={(event) => update({ priceEtb: event.target.value })} />
          </div>
          <dl className="grid gap-4 rounded-xl bg-secondary p-4 text-sm sm:grid-cols-2">
            <SummaryRow label="መድረክ" value={getPlatform(draft.platform)?.name ?? ""} />
            <SummaryRow label="የአካውንት ስም" value={draft.username} />
            <SummaryRow label="ዘርፍ" value={labelOf(categories, draft.category)} />
            <SummaryRow label="ዋና ሀገር" value={labelOf(countries, draft.country)} />
            <SummaryRow label="ተከታዮች" value={draft.followers} />
            <SummaryRow label="ዋጋ" value={Number(draft.priceEtb) > 0 ? formatPrice(Number(draft.priceEtb)) : "—"} />
          </dl>
        </div>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" disabled={step === 0 || pending} onClick={() => setStep(step - 1)}>
          ተመለስ
        </Button>
        <Button type="submit" disabled={!canContinue || pending}>
          {pending ? "በመላክ ላይ…" : step === stepTitles.length - 1 ? "ለግምገማ ላክ" : "ቀጥል"}
        </Button>
      </div>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{value}</dd>
    </div>
  );
}
