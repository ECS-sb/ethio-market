"use client";

import { useState, useTransition } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import { PlatformMark } from "@/components/brand";
import { FieldSelect } from "@/components/field-select";
import { LocaleLink, useT } from "@/components/i18n-provider";
import { ScreenshotPicker } from "@/components/screenshot-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { createListingAction } from "@/lib/actions";
import { categories, countries, formatPrice, getPlatform, labelOf, platforms } from "@/lib/catalog";
import type { MessageKey } from "@/lib/messages";

const stepTitles: MessageKey[] = ["Choose a platform", "Account details", "Price and summary"];
const USERNAME_PATTERN = /^@?[A-Za-z0-9._-]{1,60}$/;
const youtubeFlags = [
  { key: "monetized", label: "Monetized" },
  { key: "strikeFree", label: "Strike and copyright free" },
  { key: "noAdsense", label: "Without AdSense" },
] as const;

type Draft = {
  platform: string;
  username: string;
  special: boolean;
  originalEmail: boolean;
  monetized: boolean;
  strikeFree: boolean;
  noAdsense: boolean;
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
  monetized: false,
  strikeFree: false,
  noAdsense: false,
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
  const t = useT();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  const canContinue = [
    Boolean(draft.platform),
    USERNAME_PATTERN.test(draft.username.trim()) && Boolean(draft.category && draft.country) && Number(draft.followers) >= 0 && draft.followers !== "" && screenshots.length > 0,
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
    for (const file of screenshots) data.append("screenshots", file);
    startTransition(async () => {
      const result = await createListingAction(data);
      if (result.ok && result.code) setCode(result.code);
      else toast.error(t(result.message));
    });
  };

  if (code) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <CheckCircle2Icon className="size-12 text-primary" />
        <h2 className="text-2xl font-semibold">{t("Your listing was sent for review")}</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("To prove ownership, put this code in the account's bio. The listing goes live once an admin has checked it.")}
        </p>
        <code className="rounded-xl bg-secondary px-6 py-4 font-mono text-2xl font-semibold text-primary">{code}</code>
        <p className="text-xs text-muted-foreground">{t("Never send the account's password to anyone.")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDraft(emptyDraft);
              setScreenshots([]);
              setStep(0);
              setCode(null);
            }}
          >
            {t("Add another listing")}
          </Button>
          <LocaleLink href="/dashboard/seller" className={buttonVariants()}>
            {t("Go to seller dashboard")}
          </LocaleLink>
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
        <p className="text-sm text-muted-foreground">{t("Step {step} of {total}", { step: step + 1, total: stepTitles.length })}</p>
        <h2 className="text-2xl font-semibold">{t(stepTitles[step])}</h2>
        <Progress value={((step + 1) / stepTitles.length) * 100} aria-label={t("Progress")} />
      </div>

      {step === 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3" role="radiogroup" aria-label={t("Platform")}>
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
            <Label htmlFor="username">{t("Account username")}</Label>
            <Input id="username" dir="ltr" required placeholder="@username" value={draft.username} onChange={(event) => update({ username: event.target.value })} />
            <p className="text-xs text-muted-foreground">{t("The username is partly hidden from the public. Never enter a password.")}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">{t("Category")}</Label>
            <FieldSelect id="category" value={draft.category} onChange={(value) => update({ category: value })} options={categories} placeholder={t("Choose")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="country">{t("Audience's main country")}</Label>
            <FieldSelect id="country" value={draft.country} onChange={(value) => update({ country: value })} options={countries} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="followers">{t("Followers")}</Label>
            <Input id="followers" type="number" min={0} required value={draft.followers} onChange={(event) => update({ followers: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="posts">{t("Posts (optional)")}</Label>
            <Input id="posts" type="number" min={0} value={draft.posts} onChange={(event) => update({ posts: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="engagement">{t("Engagement % (optional)")}</Label>
            <Input id="engagement" type="number" min={0} max={100} step="0.1" value={draft.engagement} onChange={(event) => update({ engagement: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="femaleShare">{t("Female audience % (optional)")}</Label>
            <Input id="femaleShare" type="number" min={0} max={100} value={draft.femaleShare} onChange={(event) => update({ femaleShare: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="joinedYear">{t("Year created (optional)")}</Label>
            <Input id="joinedYear" type="number" min={2004} value={draft.joinedYear} onChange={(event) => update({ joinedYear: event.target.value })} />
          </div>
          <div className="flex flex-col justify-end gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="originalEmail" checked={draft.originalEmail} onCheckedChange={(checked) => update({ originalEmail: checked === true })} />
              <Label htmlFor="originalEmail">{t("Original email is included")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="special" checked={draft.special} onCheckedChange={(checked) => update({ special: checked === true })} />
              <Label htmlFor="special">{t("Special name (shown publicly)")}</Label>
            </div>
          </div>
          {draft.platform === "youtube" ? (
            <div className="flex flex-wrap gap-6 md:col-span-2">
              {youtubeFlags.map((flag) => (
                <div key={flag.key} className="flex items-center gap-2">
                  <Checkbox id={flag.key} checked={draft[flag.key]} onCheckedChange={(checked) => update({ [flag.key]: checked === true })} />
                  <Label htmlFor={flag.key}>{t(flag.label)}</Label>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="description">{t("Description")}</Label>
            <Textarea id="description" maxLength={2000} value={draft.description} onChange={(event) => update({ description: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <p className="text-sm font-medium">{t("Channel screenshots")}</p>
            <p className="text-xs text-muted-foreground">{t("Add 1 to 4 screenshots of the analytics, such as views, watch time and revenue. We optimize them automatically.")}</p>
            <p className="text-xs text-primary">{t("Cover the channel name and profile picture first. The name stays hidden until payment is confirmed.")}</p>
            <ScreenshotPicker files={screenshots} onChange={setScreenshots} />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="priceEtb">{t("Price (ETB)")}</Label>
            <Input id="priceEtb" type="number" min={1} step={1} required value={draft.priceEtb} onChange={(event) => update({ priceEtb: event.target.value })} />
          </div>
          <dl className="grid gap-4 rounded-xl bg-secondary p-4 text-sm sm:grid-cols-2">
            <SummaryRow label={t("Platform")} value={getPlatform(draft.platform)?.name ?? ""} />
            <SummaryRow label={t("Account username")} value={draft.username} />
            <SummaryRow label={t("Category")} value={t(labelOf(categories, draft.category))} />
            <SummaryRow label={t("Main country")} value={t(labelOf(countries, draft.country))} />
            <SummaryRow label={t("Followers")} value={draft.followers} />
            <SummaryRow label={t("Channel screenshots")} value={String(screenshots.length)} />
            <SummaryRow label={t("Price")} value={Number(draft.priceEtb) > 0 ? formatPrice(t, Number(draft.priceEtb)) : "—"} />
          </dl>
        </div>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" disabled={step === 0 || pending} onClick={() => setStep(step - 1)}>
          {t("Back")}
        </Button>
        <Button type="submit" disabled={!canContinue || pending}>
          {pending ? t("Sending…") : step === stepTitles.length - 1 ? t("Send for review") : t("Continue")}
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
