import type { Metadata } from "next";
import { ActionButton } from "@/components/action-form";
import { OrderProgress, PaymentNotice } from "@/components/order-progress";
import { confirmReceivedAction, openDisputeAction } from "@/lib/actions";
import { formatPrice, getPlatform } from "@/lib/catalog";
import { getBuyerOrders } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "ግዢዎቼ" };

export default async function BuyerOrdersPage() {
  const user = await requireUser("/dashboard/buyer/orders");
  const orders = await getBuyerOrders(user.id);

  return (
    <>
      <h1 className="text-3xl font-semibold">ግዢዎቼ</h1>
      {orders.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">ገና ግዢ የለም።</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <article key={order.id} className="flex flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold break-all" dir="ltr">
                  @{order.handle}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {getPlatform(order.platform)?.name} · {formatPrice(order.amountEtb)}
                </p>
              </div>
              <OrderProgress status={order.status} />
              {order.status === "AWAITING_PAYMENT" ? <PaymentNotice /> : null}
              {order.status === "PAID" || order.status === "TRANSFERRED" ? (
                <div className="flex flex-wrap gap-2">
                  {order.status === "TRANSFERRED" ? (
                    <ActionButton action={confirmReceivedAction} id={order.id}>
                      አካውንቱን ተቀብያለሁ
                    </ActionButton>
                  ) : null}
                  <ActionButton action={openDisputeAction} id={order.id} variant="outline">
                    ክርክር ክፈት
                  </ActionButton>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
