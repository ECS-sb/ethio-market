import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { escrowStages, howItWorksSteps } from "@/lib/data";

export const metadata: Metadata = { title: "እንዴት ይሰራል" };

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro
        eyebrow="ሂደቱ"
        title={
          <>
            ከማስታወቂያ እስከ <span className="text-gold">ርክክብ።</span>
          </>
        }
        description="ገዢውም ሻጩም እያንዳንዱን ደረጃ ማየት እንዲችሉ የተዘጋጀ ሂደት።"
      />
      <ol className="grid gap-6 md:grid-cols-2">
        {howItWorksSteps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <span className="text-3xl font-semibold text-primary">0{index + 1}.</span>
            <h2 className="text-xl font-semibold">{step.title}</h2>
            <p className="text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
      <section className="flex flex-col gap-6 pt-12">
        <h2 className="text-3xl font-semibold">
          የ<span className="text-gold">Escrow</span> ደረጃዎች
        </h2>
        <ol className="flex flex-col gap-4 md:flex-row">
          {escrowStages.map((stage, index) => (
            <li key={stage} className="flex flex-1 items-center gap-4 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <span className="text-sm">{stage}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="flex flex-wrap gap-2 pt-6">
        <Link href="/accounts" className={buttonVariants({ size: "lg" })}>
          ገበያውን ይመልከቱ
        </Link>
        <Link href="/sell" className={buttonVariants({ size: "lg", variant: "outline" })}>
          አካውንት ይሽጡ
        </Link>
      </div>
    </>
  );
}
