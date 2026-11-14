"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const t = useT();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={t("Copy {item}", { item: label })}
      title={t("Copy")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success(t("Copied"));
        } catch {
          toast.error(t("Couldn't copy. Select the text and copy it yourself."));
        }
      }}
    >
      <CopyIcon />
    </Button>
  );
}
