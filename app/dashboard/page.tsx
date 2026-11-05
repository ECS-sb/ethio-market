import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { escrowStages, formatCount, formatPrice, getListing, myListings, myOffers, myOrders } from "@/lib/data";

export default function DashboardPage() {
  const totalViews = myListings.reduce((sum, item) => sum + item.views, 0);
  const openOrders = myOrders.filter((order) => order.stage < escrowStages.length - 1);
  const stats = [
    { label: "ማስታወቂያዎች", value: String(myListings.length) },
    { label: "ዕይታዎች", value: formatCount(totalViews) },
    { label: "አዲስ ቅናሾች", value: String(myOffers.length) },
    { label: "ክፍት ትዕዛዞች", value: String(openOrders.length) },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="text-3xl font-semibold">
          እንኳን ደህና <span className="text-gold">መጡ</span>
        </h1>
        <Link href="/sell" className={buttonVariants()}>
          አዲስ ማስታወቂያ
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <p className="text-3xl font-semibold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <Card className="bg-card/70 [--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle>ክፍት ትዕዛዞች</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {openOrders.map((order) => (
            <div key={order.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span>
                  <span dir="ltr">@{getListing(order.listingId)?.handle}</span> · {order.role}
                </span>
                <span className="font-semibold">{formatPrice(order.amount)}</span>
              </div>
              <Progress value={((order.stage + 1) / escrowStages.length) * 100} aria-label={`${order.id} ሂደት`} />
              <p className="text-xs text-muted-foreground">{escrowStages[order.stage]}</p>
            </div>
          ))}
          <Link href="/dashboard/orders" className={buttonVariants({ variant: "outline", className: "w-fit" })}>
            ሁሉንም ትዕዛዞች
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
