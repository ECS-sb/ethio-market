import { ActionForm, SubmitButton } from "@/components/action-form";
import { PageIntro } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createContactAction } from "@/lib/actions";
import { contact } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";

export const generateMetadata = pageTitle("Contact us");

export default async function ContactPage() {
  const t = await getT();
  const channels = [
    { label: t("Telegram channel"), value: contact.telegramChannel, href: contact.telegramChannelUrl },
    { label: t("Message us on Telegram"), value: contact.telegramUser, href: contact.telegramUserUrl },
    { label: t("Phone"), value: contact.phone, href: contact.phoneUrl },
  ];
  return (
    <>
      <PageIntro
        eyebrow={t("Contact us")}
        title={
          <>
            {t("How can we")} <span className="text-gold">{t("help?")}</span>
          </>
        }
        description={t("Write to us with your question.")}
      />
      <div className="grid max-w-2xl gap-6 sm:grid-cols-3">
        {channels.map((channel) => (
          <a
            key={channel.href}
            href={channel.href}
            target={channel.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex min-w-0 flex-col gap-1 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:ring-primary/60"
          >
            <span className="text-xs text-muted-foreground">{channel.label}</span>
            <span dir="ltr" className="text-sm font-semibold break-all text-primary">
              {channel.value}
            </span>
          </a>
        ))}
      </div>
      <ActionForm action={createContactAction} className="flex max-w-2xl flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t("Name")}</Label>
            <Input id="name" name="name" required maxLength={100} autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("Email")}</Label>
            <Input id="email" name="email" type="email" required maxLength={200} autoComplete="email" dir="ltr" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="body">{t("Message")}</Label>
          <Textarea id="body" name="body" required maxLength={2000} rows={6} />
        </div>
        <SubmitButton size="lg" className="w-fit">
          {t("Send message")}
        </SubmitButton>
      </ActionForm>
    </>
  );
}
