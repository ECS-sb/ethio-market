import Link from "next/link";
import { ShoppingBagIcon, StoreIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getBuyerOffers, getBuyerOrders, getSellerListings, getSellerOffers, getSellerOrders } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
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
      title: "የገዢ ዳሽቦርድ",
      href: "/dashboard/buyer",
      icon: ShoppingBagIcon,
      stats: [
        { label: "መልስ የሚጠብቁ ቅናሾች", value: buyerOffers.filter((offer) => offer.status === "PENDING").length },
        { label: "ክፍት ግዢዎች", value: buyerOrders.filter((order) => open(order.status)).length },
      ],
    },
    {
      title: "የሻጭ ዳሽቦርድ",
      href: "/dashboard/seller",
      icon: StoreIcon,
      stats: [
        { label: "ማስታወቂያዎች", value: listings.length },
        { label: "አዲስ ቅናሾች", value: sellerOffers.filter((offer) => offer.status === "PENDING").length },
        { label: "ክፍት ሽያጮች", value: sellerOrders.filter((order) => open(order.status)).length },
      ],
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-semibold">
        እንኳን ደህና መጡ፣ <span className="text-gold">{user.name.split(" ")[0]}</span>
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
            <Link href={section.href} className={buttonVariants({ variant: "outline", className: "mt-auto w-fit" })}>
              ክፈት
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}
