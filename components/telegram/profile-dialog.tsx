"use client";

import { ExternalLinkIcon, EyeIcon, XIcon } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { CopyButton } from "@/components/telegram/copy-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { CustomerProfile, ProfileAccount } from "@/lib/telegram/profile";
import { telegramTheme } from "@/lib/telegram/theme";

type Stats = { firstSeen: string; messages: number; deals: number; paid: string | null };

function linkFor(account: ProfileAccount): string | null {
  if (account.platform === "Username") return null;
  return account.value.startsWith("http") ? account.value : `https://${account.value}`;
}

function Row({ label, value, copyLabel, href }: { label?: string; value: string; copyLabel: string; href?: string | null }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-1.5">
      <span className="flex min-w-0 flex-col">
        {label ? <span className="text-[11px] text-muted-foreground">{label}</span> : null}
        <span dir="auto" className="truncate font-medium">
          {value}
        </span>
      </span>
      <span className="flex shrink-0 items-center">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" aria-label={value} className="p-1.5 text-muted-foreground hover:text-foreground">
            <ExternalLinkIcon className="size-4" />
          </a>
        ) : null}
        <CopyButton value={value} label={copyLabel} />
      </span>
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      <ul className="flex flex-col gap-1.5">{children}</ul>
    </section>
  );
}

/** ከስሙ ጎን ያለው 👁፦ ደንበኛው ያጋራቸው ስልኮች፣ ኢሜይሎች፣ አካውንቶች እና ለሽያጭ ያመጣቸው (ሁሉም ኮፒ ይደረጋሉ)። */
export function ProfileDialog({
  name,
  username,
  telegramId,
  profile,
  stats,
}: {
  name: string;
  username: string | null;
  telegramId: string;
  profile: CustomerProfile;
  stats: Stats;
}) {
  const t = useT();
  const nothingShared = profile.phones.length + profile.emails.length + profile.forSale.length + profile.accounts.length === 0 && !profile.notes;

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={t("Customer details")} title={t("Customer details")} />}
      >
        <EyeIcon />
      </DialogTrigger>
      {/* መስኮቱ ከገጹ ውጭ (portal) ስለሚከፈት የቴሌግራም ቀለሞችን በራሱ ይወስዳል። */}
      <DialogContent showCloseButton={false} style={telegramTheme} className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        <div className="flex items-center justify-between gap-4">
          <DialogTitle className="truncate">{name}</DialogTitle>
          <DialogClose render={<Button variant="ghost" size="icon-sm" aria-label={t("Close")} />}>
            <XIcon />
          </DialogClose>
        </div>

        <Section title={t("Telegram")}>
          {username ? <Row label={t("Username")} value={`@${username}`} copyLabel={t("Username")} href={`https://t.me/${username}`} /> : null}
          <Row label={t("Telegram user ID")} value={telegramId} copyLabel={t("Telegram user ID")} />
        </Section>

        {profile.phones.length > 0 ? (
          <Section title={t("Phone numbers")}>
            {profile.phones.map((phone) => (
              <Row key={phone} value={phone} copyLabel={phone} href={`tel:${phone}`} />
            ))}
          </Section>
        ) : null}

        {profile.emails.length > 0 ? (
          <Section title={t("Emails")}>
            {profile.emails.map((email) => (
              <Row key={email} value={email} copyLabel={email} />
            ))}
          </Section>
        ) : null}

        {profile.forSale.length > 0 ? (
          <Section title={t("Accounts brought for sale")}>
            {profile.forSale.map((account) => (
              <Row
                key={account.value}
                label={[account.platform, account.details].filter(Boolean).join(" · ")}
                value={account.value}
                copyLabel={account.value}
                href={linkFor(account)}
              />
            ))}
          </Section>
        ) : null}

        {profile.accounts.length > 0 ? (
          <Section title={t("Other accounts and links")}>
            {profile.accounts.map((account) => (
              <Row key={account.value} label={account.platform === "Username" ? t("Username") : account.platform} value={account.value} copyLabel={account.value} href={linkFor(account)} />
            ))}
          </Section>
        ) : null}

        {profile.notes ? (
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-semibold text-muted-foreground">{t("Notes")}</h3>
            <p className="break-words whitespace-pre-line">{profile.notes}</p>
          </section>
        ) : null}

        {nothingShared ? <p className="text-muted-foreground">{t("The customer hasn't shared a phone number or account yet.")}</p> : null}

        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-muted/60 p-2">
            <dt className="text-muted-foreground">{t("First message")}</dt>
            <dd className="font-medium">{stats.firstSeen}</dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-2">
            <dt className="text-muted-foreground">{t("Messages")}</dt>
            <dd className="font-medium">{stats.messages}</dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-2">
            <dt className="text-muted-foreground">{t("Deals")}</dt>
            <dd className="font-medium">{stats.deals}</dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-2">
            <dt className="text-muted-foreground">{t("Paid")}</dt>
            <dd className="font-medium">{stats.paid ?? "—"}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
