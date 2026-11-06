import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Ethiopic, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const notoSansEthiopic = Noto_Sans_Ethiopic({ variable: "--font-noto-ethiopic", subsets: ["ethiopic"] });

export const metadata: Metadata = {
  title: "404 | Ethio Market",
  description: "Page not found",
};

// ይህ ገጽ layoutን ስለሚዘል ቋንቋውን አያውቅም፣ ስለዚህ በሁለቱም ቋንቋዎች ይታያል።
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`dark scheme-dark ${plusJakarta.variable} ${dmSans.variable} ${notoSansEthiopic.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
          <p className="text-6xl font-semibold text-primary">404</p>
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p lang="am" className="text-2xl font-semibold">
            ገጹ አልተገኘም
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/" className={buttonVariants({ size: "lg" })}>
              Back to home
            </Link>
            <Link href="/am" lang="am" className={buttonVariants({ size: "lg", variant: "outline" })}>
              ወደ መነሻ ገጽ
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
