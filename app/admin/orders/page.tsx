import type { Metadata } from "next";
import { ActionButton } from "@/components/action-form";
import { OrderProgress } from "@/components/order-progress";
import { cancelOrderAction, confirmPaymentAction, releaseOrderAction } from "@/lib/actions";
import { formatDate, formatPrice, getPlatform } from "@/lib/catalog";
import { getAdminOrders } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "ትዕዛዞች" };

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAdminOrders();

  return (
    <>
      <h1 className="text-3xl font-semibold">ትዕዛዞች</h1>
      {orders.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">ገና ትዕዛዝ የለም።</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <article key={order.id} className="flex flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold break-all" dir="ltr">
                  {getPlatform(order.listing.platform)?.name} · @{order.listing.username}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(order.amountEtb)} · {formatDate(order.createdAt)}
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  ገዢ፦ {order.buyer.name} ({order.buyer.email})
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  ሻጭ፦ {order.seller.name} ({order.seller.email})
                </p>
              </div>
              <OrderProgress status={order.status} />
              <div className="flex flex-wrap gap-2">
                {order.status === "AWAITING_PAYMENT" ? (
                  <ActionButton action={confirmPaymentAction} id={order.id}>
                    ክፍያ ደርሷል
                  </ActionButton>
                ) : null}
                {order.status === "CONFIRMED" || order.status === "DISPUTED" ? (
                  <ActionButton action={releaseOrderAction} id={order.id}>
                    ለሻጩ አጠናቅቅ
                  </ActionButton>
                ) : null}
                {["AWAITING_PAYMENT", "PAID", "TRANSFERRED", "DISPUTED"].includes(order.status) ? (
                  <ActionButton action={cancelOrderAction} id={order.id} variant="outline">
                    ትዕዛዙን ሰርዝ
                  </ActionButton>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
