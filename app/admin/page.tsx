import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { getAdminStats } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  await requireAdmin();
  const stats = await getAdminStats();
  const tiles = [
    { label: "ግምገማ የሚጠብቁ ማስታወቂያዎች", value: stats.pendingListings, href: "/admin/listings" },
    { label: "ክፍት ትዕዛዞች", value: stats.openOrders, href: "/admin/orders" },
    { label: "ክርክሮች", value: stats.disputes, href: "/admin/orders" },
    { label: "ሪፖርቶች", value: stats.openReports, href: "/admin/reports" },
    { label: "የመልዕክት ጥያቄዎች", value: stats.openContacts, href: "/admin/reports" },
    { label: "ተጠቃሚዎች", value: stats.users, href: "/admin/users" },
    { label: "ገበያ ላይ ያሉ", value: stats.liveListings, href: "/accounts" },
    { label: "የተጠናቀቁ ትዕዛዞች", value: stats.releasedCount, href: "/admin/orders" },
  ];

  return (
    <>
      <h1 className="text-3xl font-semibold">
        <span className="text-gold">አድሚን</span> ዳሽቦርድ
      </h1>
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href} className="flex flex-col gap-1 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 transition-all hover:ring-primary/60">
            <span className="text-3xl font-semibold text-primary">{tile.value}</span>
            <span className="text-sm text-muted-foreground">{tile.label}</span>
          </Link>
        ))}
      </div>
      <p className="rounded-xl bg-card/70 p-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
        የተጠናቀቁ ትዕዛዞች አጠቃላይ ዋጋ፦ <span className="font-semibold text-foreground">{formatPrice(stats.releasedTotal)}</span>
      </p>
    </>
  );
}
