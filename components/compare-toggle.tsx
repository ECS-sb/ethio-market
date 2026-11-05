"use client";

import { CheckIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MAX_COMPARE, useCompare } from "@/components/compare-store";

export function CompareToggle({ id }: { id: string }) {
  const { ids, toggle } = useCompare();
  const active = ids.includes(id);

  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={active}
      onClick={() => {
        if (toggle(id) === "full") {
          toast.error(`በአንድ ጊዜ እስከ ${MAX_COMPARE} አካውንቶች ብቻ ማወዳደር ይቻላል።`);
        }
      }}
    >
      {active ? <CheckIcon data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
      {active ? "ተጨምሯል" : "አወዳድር"}
    </Button>
  );
}
