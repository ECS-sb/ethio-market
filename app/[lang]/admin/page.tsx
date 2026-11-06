import { LocaleLink } from "@/components/i18n-provider";
import { formatPrice } from "@/lib/catalog";
import { getT } from "@/lib/i18n-server";
import { getAdminStats } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  const t = await getT();
  await requireAdmin();
  const stats = await getAdminStats();
  const tiles = [
    { label: t("Listings awaiting review"), value: stats.pendingListings, href: "/admin/listings" },
    { label: t("Open orders"), value: stats.openOrders, href: "/admin/orders" },
    { label: t("Disputes"), value: stats.disputes, href: "/admin/orders" },
    { label: t("Reports"), value: stats.openReports, href: "/admin/reports" },
    { label: t("Contact requests"), value: stats.openContacts, href: "/admin/reports" },
    { label: t("Users"), value: stats.users, href: "/admin/users" },
    { label: t("Live on the market"), value: stats.liveListings, href: "/accounts" },
    { label: t("Completed orders"), value: stats.releasedCount, href: "/admin/orders" },
  ];

  return (
    <>
      <h1 className="text-3xl font-semibold">
        <span className="text-gold">{t("Admin")}</span> {t("dashboard")}
      </h1>
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
        {tiles.map((tile) => (
          <LocaleLink key={tile.label} href={tile.href} className="flex flex-col gap-1 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:ring-primary/60">
            <span className="text-3xl font-semibold text-primary">{tile.value}</span>
            <span className="text-sm text-muted-foreground">{tile.label}</span>
          </LocaleLink>
        ))}
      </div>
      <p className="rounded-xl bg-card/70 p-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
        {t("Total value of completed orders:")} <span className="font-semibold text-foreground">{formatPrice(t, stats.releasedTotal)}</span>
      </p>
    </>
  );
}
