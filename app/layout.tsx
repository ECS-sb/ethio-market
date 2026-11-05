import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Noto_Sans_Ethiopic, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Ethio Market", template: "%s | Ethio Market" },
  description: "የሶሻል ሚዲያ አካውንቶች መገበያያ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="am"
      className={`dark scheme-dark ${plusJakarta.variable} ${dmSans.variable} ${notoSansEthiopic.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
