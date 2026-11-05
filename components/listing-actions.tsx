"use client";

import { useState } from "react";
import Link from "next/link";
import { FlagIcon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { CompareToggle } from "@/components/compare-toggle";
import { FieldSelect } from "@/components/field-select";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/data";

const reportReasons = [
  { value: "fake", label: "የሐሰት መረጃ" },
  { value: "ownership", label: "የባለቤትነት ጥርጣሬ" },
  { value: "other", label: "ሌላ" },
];

export function ListingActions({ id, price }: { id: string; price: number }) {
  const [offerOpen, setOfferOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("fake");

  return (
    <div className="flex flex-col gap-2">
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogTrigger render={<Button size="lg" className="w-full" />}>በEscrow ይግዙ / ቅናሽ ያቅርቡ</DialogTrigger>
        <DialogContent>
          <form
            className="flex flex-col gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              setOfferOpen(false);
              toast.success("ይህ ማሳያ ነው፤ ቅናሹ አልተላከም።");
            }}
          >
            <DialogHeader>
              <DialogTitle>ቅናሽ ያቅርቡ</DialogTitle>
              <DialogDescription>የተጠየቀው ዋጋ {formatPrice(price)} ነው።</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="offer-amount">የእርስዎ ቅናሽ (ብር)</Label>
              <Input id="offer-amount" name="amount" type="number" min={1} step={1} required defaultValue={price} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="offer-note">መልዕክት (አማራጭ)</Label>
              <Textarea id="offer-note" name="note" />
            </div>
            <DialogFooter>
              <Button type="submit">ቅናሹን ላክ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Link href={`/dashboard/messages`} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>
        <MessageCircleIcon data-icon="inline-start" />
        ሻጩን ያነጋግሩ
      </Link>

      <div className="grid grid-cols-2 gap-2">
        <CompareToggle id={id} />
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogTrigger render={<Button variant="ghost" />}>
            <FlagIcon data-icon="inline-start" />
            ሪፖርት
          </DialogTrigger>
          <DialogContent>
            <form
              className="flex flex-col gap-6"
              onSubmit={(event) => {
                event.preventDefault();
                setReportOpen(false);
                toast.success("ይህ ማሳያ ነው፤ ሪፖርቱ አልተላከም።");
              }}
            >
              <DialogHeader>
                <DialogTitle>ማስታወቂያውን ሪፖርት ያድርጉ</DialogTitle>
                <DialogDescription>ችግሩን ይምረጡ።</DialogDescription>
              </DialogHeader>
              <FieldSelect value={reason} onChange={setReason} options={reportReasons} />
              <DialogFooter>
                <Button type="submit">ሪፖርት ላክ</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
