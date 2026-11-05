import type { Metadata } from "next";
import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { escrowStages, formatPrice, getListing, myOrders } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Escrow ትዕዛዞች" };

export default function OrdersPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Escrow ትዕዛዞች</h1>
      <div className="flex flex-col gap-6">
        {myOrders.map((order) => (
          <article key={order.id} className="flex flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold">{order.id}</h2>
                <p className="text-sm text-muted-foreground">
                  <span dir="ltr">@{getListing(order.listingId)?.handle}</span> · {formatPrice(order.amount)}
                </p>
              </div>
              <Badge variant="secondary">{order.role}</Badge>
            </div>
            <ol className="grid gap-4 sm:grid-cols-5">
              {escrowStages.map((stage, index) => {
                const reached = index <= order.stage;
                return (
                  <li key={stage} aria-current={index === order.stage ? "step" : undefined} className="flex items-center gap-2 sm:flex-col sm:items-start">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        reached ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {reached ? <CheckIcon className="size-4" /> : index + 1}
                    </span>
                    <span className={cn("text-xs", reached ? "text-foreground" : "text-muted-foreground")}>{stage}</span>
                  </li>
                );
              })}
            </ol>
          </article>
        ))}
      </div>
    </>
  );
}
