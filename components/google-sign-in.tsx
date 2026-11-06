"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function GoogleSignIn({ next }: { next: string }) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const { error } = await authClient.signIn.social({ provider: "google", callbackURL: next });
        if (error) {
          setPending(false);
          toast.error("መግባት አልተቻለም፤ እባክዎ እንደገና ይሞክሩ።");
        }
      }}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5">
        <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.7-.2-2.5H12v4.7h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.2v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.2a12 12 0 0 0 0 10.8z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A11.9 11.9 0 0 0 1.2 6.6l4.1 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
      </svg>
      {pending ? "በመክፈት ላይ…" : "Continue with Google"}
    </Button>
  );
}
