import { Brand, GridBackdrop } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-6">
      <GridBackdrop />
      <Brand />
      <main className="w-full max-w-md rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10 backdrop-blur-sm">{children}</main>
      <p className="max-w-md text-center text-xs text-muted-foreground">
        መግቢያው ገና ከአገልጋይ ጋር አልተገናኘም፤ የሚያስገቡት መረጃ አይላክም፣ አይቀመጥም።
      </p>
    </div>
  );
}
