import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/brand";
import { SellWizard } from "@/components/sell-wizard";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "አካውንት ይሽጡ" };

const benefits = [
  { title: "ባለቤትነት ያረጋግጡ", description: "ኮዱን በአካውንቱ መግለጫ ላይ በማስቀመጥ አካውንቱ የእርስዎ መሆኑን ያሳያሉ።" },
  { title: "ቅናሾችን ይወስኑ", description: "የሚመጡትን ቅናሾች ይቀበላሉ ወይም አይቀበሉም፤ ውሳኔው የእርስዎ ነው።" },
  { title: "ከርክክብ በኋላ ይጠናቀቃል", description: "ገዢው ርክክቡን ሲያረጋግጥ አስተዳዳሪው ትዕዛዙን ያጠናቅቃል።" },
];

async function SellGate() {
  const user = await getCurrentUser();
  if (!user || user.suspended) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-12 text-center ring-1 ring-foreground/10">
        <p className="font-semibold">ማስታወቂያ ለማውጣት ይግቡ</p>
        <Link href="/login?next=%2Fsell" className={buttonVariants({ size: "lg" })}>
          በGoogle ይግቡ
        </Link>
      </div>
    );
  }
  return <SellWizard />;
}

export default function SellPage() {
  return (
    <>
      <PageIntro
        eyebrow="ለሻጮች"
        title={
          <>
            አካውንትዎን <span className="text-gold">በጥቂት ደረጃዎች</span> ያቅርቡ።
          </>
        }
        description="ማስታወቂያ ከማውጣትዎ በፊት የመድረኩ ደንብ አካውንት ማስተላለፍን መፍቀዱን ያረጋግጡ።"
      />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          <SellGate />
        </Suspense>
        <aside className="flex flex-col gap-6">
          {benefits.map((benefit, index) => (
            <div key={benefit.title} className="flex flex-col gap-2 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <p className="font-semibold text-primary">0{index + 1}.</p>
              <h2 className="font-semibold">{benefit.title}</h2>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
