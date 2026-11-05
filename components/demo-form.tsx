"use client";

import { toast } from "sonner";

export function DemoForm({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        toast.info(message);
      }}
    >
      {children}
    </form>
  );
}
