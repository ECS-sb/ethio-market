import type { Metadata } from "next";
import { PageIntro } from "@/components/brand";
import { CompareTable } from "@/components/compare-table";

export const metadata: Metadata = { title: "አወዳድር" };

export default function ComparePage() {
  return (
    <>
      <PageIntro
        eyebrow="ማወዳደሪያ"
        title={
          <>
            አካውንቶችን <span className="text-gold">ጎን ለጎን</span> ይመልከቱ።
          </>
        }
        description="እስከ አራት አካውንቶችን መምረጥ ይችላሉ።"
      />
      <CompareTable />
    </>
  );
}
