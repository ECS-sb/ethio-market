import type { Metadata } from "next";
import { OffersList } from "@/components/offers-list";

export const metadata: Metadata = { title: "ቅናሾች" };

export default function OffersPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">ቅናሾች</h1>
      <OffersList />
    </>
  );
}
