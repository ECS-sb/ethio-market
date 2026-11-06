"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions";

type ServerAction = (data: FormData) => Promise<ActionResult>;

export function ActionForm({
  action,
  className,
  onSuccess,
  children,
}: {
  action: ServerAction;
  className?: string;
  onSuccess?: (result: ActionResult) => void;
  children: React.ReactNode;
}) {
  const t = useT();
  const [, dispatch] = useActionState(async (_: ActionResult | null, data: FormData) => {
    const result = await action(data);
    if (result.ok) {
      toast.success(t(result.message));
      onSuccess?.(result);
    } else {
      toast.error(t(result.message));
    }
    return result;
  }, null);

  return (
    <form action={dispatch} className={className}>
      {children}
    </form>
  );
}

export function SubmitButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? t("Sending…") : children}
    </Button>
  );
}

/** አንድ ዒላማ ላይ አንድ ተግባር የሚፈጽም ትንሽ አዝራር። */
export function ActionButton({
  action,
  id,
  fields,
  children,
  ...props
}: {
  action: ServerAction;
  id: string;
  fields?: Record<string, string>;
} & Omit<React.ComponentProps<typeof Button>, "action" | "id">) {
  return (
    <ActionForm action={action}>
      <input type="hidden" name="id" value={id} />
      {Object.entries(fields ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton {...props}>{children}</SubmitButton>
    </ActionForm>
  );
}
