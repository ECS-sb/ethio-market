import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { orderStages, orderStatusLabels, type OrderStatusValue } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function OrderProgress({ status }: { status: OrderStatusValue }) {
  if (status === "DISPUTED" || status === "CANCELLED") {
    return <Badge variant={status === "DISPUTED" ? "destructive" : "secondary"}>{orderStatusLabels[status]}</Badge>;
  }
  const current = orderStages.indexOf(status);
  return (
    <ol className="grid gap-4 sm:grid-cols-5">
      {orderStages.map((stage, index) => {
        const reached = index <= current;
        return (
          <li key={stage} aria-current={index === current ? "step" : undefined} className="flex items-center gap-2 sm:flex-col sm:items-start">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                reached ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}
            >
              {reached ? <CheckIcon className="size-4" /> : index + 1}
            </span>
            <span className={cn("text-xs", reached ? "text-foreground" : "text-muted-foreground")}>{orderStatusLabels[stage]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function PaymentNotice() {
  return (
    <p role="note" className="rounded-xl bg-primary/15 p-4 text-sm ring-1 ring-primary/30">
      የመስመር ላይ ክፍያ ገና አልተገናኘም። ከአስተዳዳሪው መመሪያ ሳያገኙ ለማንም ገንዘብ አይላኩ።
    </p>
  );
}
