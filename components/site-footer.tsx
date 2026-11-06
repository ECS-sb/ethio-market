import { Brand } from "@/components/brand";
import { LocaleLink } from "@/components/i18n-provider";
import { contact, platforms } from "@/lib/catalog";
import { getT } from "@/lib/i18n-server";

export async function SiteFooter() {
  const t = await getT();
  const groups = [
    {
      title: t("Market"),
      links: [
        ...platforms.map((platform) => ({ href: `/accounts?platform=${platform.id}`, label: platform.name })),
        { href: "/accounts?special=1", label: t("Special usernames") },
        { href: "/sold", label: t("Sold") },
      ],
    },
    {
      title: t("Help"),
      links: [
        { href: "/how-it-works", label: t("How it works") },
        { href: "/faq", label: t("FAQ") },
        { href: "/sell", label: t("Sell an account") },
        { href: "/sellers", label: t("Top sellers") },
        { href: "/contact", label: t("Contact us") },
      ],
    },
    {
      title: t("Company"),
      links: [
        { href: "/about", label: t("About us") },
        { href: "/rules", label: t("Buyer and seller rules") },
        { href: "/terms", label: t("Terms of service") },
        { href: "/privacy", label: t("Privacy policy") },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Brand />
          <p className="text-sm text-muted-foreground">{t("A marketplace to buy and sell social media accounts in Ethiopia.")}</p>
          <div className="flex flex-col gap-2 text-sm">
            <a href="https://ethiocomputer.school" className="w-fit text-muted-foreground transition-colors hover:text-primary">
              Ethio Computer School
            </a>
            <a href="https://ethiocshub.com" className="w-fit text-muted-foreground transition-colors hover:text-primary">
              Ethio CS Hub
            </a>
            <a href={contact.telegramChannelUrl} target="_blank" rel="noopener noreferrer" className="w-fit text-muted-foreground transition-colors hover:text-primary">
              {t("Telegram channel")} <span dir="ltr">{contact.telegramChannel}</span>
            </a>
            <a href={contact.phoneUrl} dir="ltr" className="w-fit text-muted-foreground transition-colors hover:text-primary">
              {contact.phone}
            </a>
          </div>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3">
            <p className="text-sm font-semibold">{group.title}</p>
            {group.links.map((link) => (
              <LocaleLink
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </LocaleLink>
            ))}
          </nav>
        ))}
      </div>
      <div className="mx-auto w-full max-w-7xl border-t border-border px-6 py-6">
        <p className="text-xs text-muted-foreground">© Ethio Market</p>
      </div>
    </footer>
  );
}
