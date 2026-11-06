import { ActionButton } from "@/components/action-form";
import { OrderProgress } from "@/components/order-progress";
import { cancelOrderAction, confirmPaymentAction, releaseOrderAction } from "@/lib/actions";
import { formatDate, formatPrice, getPlatform } from "@/lib/catalog";
import { getT, pageTitle } from "@/lib/i18n-server";
import { getAdminOrders } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const generateMetadata = pageTitle("Orders");

export default async function AdminOrdersPage() {
  const t = await getT();
  await requireAdmin();
  const orders = await getAdminOrders();

  return (
    <>
      <h1 className="text-3xl font-semibold">{t("Orders")}</h1>
      {orders.length === 0 ? (
        <p className="rounded-xl bg-card/70 p-12 text-center text-muted-foreground ring-1 ring-foreground/10">{t("No orders yet.")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <article key={order.id} className="flex flex-col gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold break-all" dir="ltr">
                  {getPlatform(order.listing.platform)?.name} · @{order.listing.username}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(t, order.amountEtb)} · {formatDate(order.createdAt)}
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  {t("Buyer:")} {order.buyer.name} ({order.buyer.email})
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  {t("Seller:")} {order.seller.name} ({order.seller.email})
                </p>
              </div>
              <OrderProgress status={order.status} />
              <div className="flex flex-wrap gap-2">
                {order.status === "AWAITING_PAYMENT" ? (
                  <ActionButton action={confirmPaymentAction} id={order.id}>
                    {t("Payment received")}
                  </ActionButton>
                ) : null}
                {order.status === "CONFIRMED" || order.status === "DISPUTED" ? (
                  <ActionButton action={releaseOrderAction} id={order.id}>
                    {t("Complete for seller")}
                  </ActionButton>
                ) : null}
                {["AWAITING_PAYMENT", "PAID", "TRANSFERRED", "DISPUTED"].includes(order.status) ? (
                  <ActionButton action={cancelOrderAction} id={order.id} variant="outline">
                    {t("Cancel order")}
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
