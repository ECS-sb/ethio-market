"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";
import { PlatformMark } from "@/components/brand";
import { FieldSelect } from "@/components/field-select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { categories, countries, formatPrice, getPlatform, labelOf, platforms } from "@/lib/data";

const stepTitles = ["መድረክ ይምረጡ", "ባለቤትነት ያረጋግጡ", "የአካውንት መረጃ", "ዋጋ እና ማጠቃለያ"];
const VERIFICATION_CODE = "EM-DEMO-4821";

type Draft = {
  platform: string;
  username: string;
  codePlaced: boolean;
  category: string;
  country: string;
  followers: string;
  description: string;
  price: string;
};

const emptyDraft: Draft = {
  platform: "",
  username: "",
  codePlaced: false,
  category: "",
  country: "ET",
  followers: "",
  description: "",
  price: "",
};

export function SellWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [done, setDone] = useState(false);

  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  const canContinue = [
    Boolean(draft.platform),
    Boolean(draft.username.trim()) && draft.codePlaced,
    Boolean(draft.category && draft.country && Number(draft.followers) > 0),
    Number(draft.price) > 0,
  ][step];

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <CheckCircle2Icon className="size-12 text-primary" />
        <h2 className="text-2xl font-semibold">ረቂቁ ተጠናቅቋል</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          ይህ ማሳያ ስለሆነ ማስታወቂያው አልተቀመጠም፣ ለግምገማም አልተላከም። ይህ ተግባር ከአገልጋይ ጋር ሲገናኝ ይሰራል።
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDraft(emptyDraft);
              setStep(0);
              setDone(false);
            }}
          >
            እንደገና ጀምር
          </Button>
          <Link href="/dashboard/listings" className={buttonVariants()}>
            ወደ ዳሽቦርድ
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
        if (!canContinue) return;
        if (step < stepTitles.length - 1) setStep(step + 1);
        else setDone(true);
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
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">የአካውንቱ ስም</Label>
            <Input id="username" dir="ltr" required placeholder="@username" value={draft.username} onChange={(event) => update({ username: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-secondary p-4">
            <p className="text-sm text-muted-foreground">ይህን ኮድ በአካውንቱ መግለጫ (bio) ላይ ያስቀምጡ፦</p>
            <code className="font-mono text-lg font-semibold text-primary">{VERIFICATION_CODE}</code>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="code-placed" checked={draft.codePlaced} onCheckedChange={(checked) => update({ codePlaced: checked === true })} />
            <Label htmlFor="code-placed">ኮዱን አስቀምጫለሁ</Label>
          </div>
          <p className="text-xs text-muted-foreground">የይለፍ ቃል በፍጹም እዚህ አያስገቡ።</p>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-6 md:grid-cols-2">
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
            <Input id="followers" type="number" min={1} required value={draft.followers} onChange={(event) => update({ followers: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="description">መግለጫ</Label>
            <Textarea id="description" value={draft.description} onChange={(event) => update({ description: event.target.value })} />
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="price">ዋጋ (ብር)</Label>
            <Input id="price" type="number" min={1} required value={draft.price} onChange={(event) => update({ price: event.target.value })} />
          </div>
          <dl className="grid gap-4 rounded-xl bg-secondary p-4 text-sm sm:grid-cols-2">
            <SummaryRow label="መድረክ" value={getPlatform(draft.platform)?.name ?? ""} />
            <SummaryRow label="የአካውንት ስም" value={draft.username} />
            <SummaryRow label="ዘርፍ" value={labelOf(categories, draft.category)} />
            <SummaryRow label="ዋና ሀገር" value={labelOf(countries, draft.country)} />
            <SummaryRow label="ተከታዮች" value={draft.followers} />
            <SummaryRow label="ዋጋ" value={Number(draft.price) > 0 ? formatPrice(Number(draft.price)) : "—"} />
          </dl>
        </div>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          ተመለስ
        </Button>
        <Button type="submit" disabled={!canContinue}>
          {step === stepTitles.length - 1 ? "ረቂቁን ጨርስ" : "ቀጥል"}
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
