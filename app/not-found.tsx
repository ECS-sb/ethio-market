import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <p className="text-6xl font-semibold text-primary">404</p>
      <h1 className="text-2xl font-semibold">ገጹ አልተገኘም</h1>
      <p className="text-muted-foreground">የፈለጉት ገጽ የለም ወይም ተወስዷል።</p>
      <Link href="/" className={buttonVariants({ size: "lg" })}>
        ወደ መነሻ ገጽ
      </Link>
    </main>
  );
}
