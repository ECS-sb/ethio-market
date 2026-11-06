"use client";

import { CheckIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { MAX_COMPARE, useCompare } from "@/components/compare-store";

export function CompareToggle({ id }: { id: string }) {
  const t = useT();
  const { ids, toggle } = useCompare();
  const active = ids.includes(id);

  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={active}
      onClick={() => {
        if (toggle(id) === "full") {
          toast.error(t("You can compare up to {max} accounts at a time.", { max: MAX_COMPARE }));
        }
      }}
    >
      {active ? <CheckIcon data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
      {active ? t("Added") : t("Compare")}
    </Button>
  );
}
