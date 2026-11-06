import { ShoppingBagIcon, StoreIcon } from "lucide-react";
import { LocaleLink } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n-server";
import { getBuyerOffers, getBuyerOrders, getSellerListings, getSellerOffers, getSellerOrders } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const t = await getT();
  const user = await requireUser("/dashboard");
  const [buyerOffers, buyerOrders, listings, sellerOffers, sellerOrders] = await Promise.all([
    getBuyerOffers(user.id),
    getBuyerOrders(user.id),
    getSellerListings(user.id),
    getSellerOffers(user.id),
    getSellerOrders(user.id),
  ]);
  const open = (status: string) => !["RELEASED", "CANCELLED"].includes(status);

  const sections = [
    {
      title: t("Buyer dashboard"),
      href: "/dashboard/buyer",
      icon: ShoppingBagIcon,
      stats: [
        { label: t("Offers awaiting reply"), value: buyerOffers.filter((offer) => offer.status === "PENDING").length },
        { label: t("Open purchases"), value: buyerOrders.filter((order) => open(order.status)).length },
      ],
    },
    {
      title: t("Seller dashboard"),
      href: "/dashboard/seller",
      icon: StoreIcon,
      stats: [
        { label: t("Listings"), value: listings.length },
        { label: t("New offers"), value: sellerOffers.filter((offer) => offer.status === "PENDING").length },
        { label: t("Open sales"), value: sellerOrders.filter((order) => open(order.status)).length },
      ],
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-semibold">
        {t("Welcome,")} <span className="text-gold">{user.name.split(" ")[0]}</span>
      </h1>
      <div className="grid gap-6 xl:grid-cols-2">
        {sections.map((section) => (
          <section key={section.href} className="flex flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <section.icon className="size-5 text-primary" />
              {section.title}
            </h2>
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {section.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <dd className="text-3xl font-semibold text-primary">{stat.value}</dd>
                  <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                </div>
              ))}
            </dl>
            <LocaleLink href={section.href} className={buttonVariants({ variant: "outline", className: "mt-auto w-fit" })}>
              {t("Open")}
            </LocaleLink>
          </section>
        ))}
      </div>
    </>
  );
}
