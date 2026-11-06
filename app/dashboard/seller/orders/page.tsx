import type { Metadata } from "next";
import { ActionButton } from "@/components/action-form";
import { OrderProgress, PaymentNotice } from "@/components/order-progress";
import { markTransferredAction, openDisputeAction } from "@/lib/actions";
import { formatPrice, getPlatform } from "@/lib/catalog";
import { getSellerOrders } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "ሽያጮቼ" };

export default async function SellerOrdersPage() {
  const user = await requireUser("/dashboard/seller/orders");
  const orders = await getSellerOrders(user.id);

  return (
    <>
      <h1 className="text-3xl font-semibold">ሽያጮቼ</h1>
      {orders.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">ገና ሽያጭ የለም።</p>
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
              {order.status === "PAID" ? (
                <p className="text-sm text-muted-foreground">ክፍያው ተረጋግጧል። አካውንቱን ለገዢው ያስተላልፉ፤ የይለፍ ቃል በዚህ ድረ-ገጽ መልዕክት አይላኩ።</p>
              ) : null}
              {order.status === "PAID" || order.status === "TRANSFERRED" ? (
                <div className="flex flex-wrap gap-2">
                  {order.status === "PAID" ? (
                    <ActionButton action={markTransferredAction} id={order.id}>
                      አካውንቱን አስተላልፌያለሁ
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
