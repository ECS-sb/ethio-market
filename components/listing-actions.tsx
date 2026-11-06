"use client";

import { useState } from "react";
import { FlagIcon, MessageCircleIcon } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { CompareToggle } from "@/components/compare-toggle";
import { FieldSelect } from "@/components/field-select";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
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
import { createOfferAction, createReportAction, startConversationAction } from "@/lib/actions";
import { formatPrice, reportReasons } from "@/lib/catalog";

export function ListingActions({ id, price, canOffer }: { id: string; price: number; canOffer: boolean }) {
  const t = useT();
  const [offerOpen, setOfferOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("fake");

  return (
    <div className="flex flex-col gap-2">
      {canOffer ? (
        <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
          <DialogTrigger render={<Button size="lg" className="w-full" />}>{t("Make an offer")}</DialogTrigger>
          <DialogContent>
            <ActionForm action={createOfferAction} className="flex flex-col gap-6" onSuccess={() => setOfferOpen(false)}>
              <input type="hidden" name="listingId" value={id} />
              <DialogHeader>
                <DialogTitle>{t("Make an offer")}</DialogTitle>
                <DialogDescription>{t("The asking price is {price}.", { price: formatPrice(t, price) })}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor="offer-amount">{t("Your offer (ETB)")}</Label>
                <Input id="offer-amount" name="amountEtb" type="number" min={1} step={1} required defaultValue={price} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="offer-note">{t("Message (optional)")}</Label>
                <Textarea id="offer-note" name="note" maxLength={500} />
              </div>
              <DialogFooter>
                <SubmitButton>{t("Send offer")}</SubmitButton>
              </DialogFooter>
            </ActionForm>
          </DialogContent>
        </Dialog>
      ) : null}

      <ActionForm action={startConversationAction}>
        <input type="hidden" name="listingId" value={id} />
        <SubmitButton variant="outline" size="lg" className="w-full">
          <MessageCircleIcon data-icon="inline-start" />
          {t("Message the seller")}
        </SubmitButton>
      </ActionForm>

      <div className="grid grid-cols-2 gap-2">
        <CompareToggle id={id} />
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogTrigger render={<Button variant="ghost" />}>
            <FlagIcon data-icon="inline-start" />
            {t("Report")}
          </DialogTrigger>
          <DialogContent>
            <ActionForm action={createReportAction} className="flex flex-col gap-6" onSuccess={() => setReportOpen(false)}>
              <input type="hidden" name="listingId" value={id} />
              <input type="hidden" name="reason" value={reason} />
              <DialogHeader>
                <DialogTitle>{t("Report this listing")}</DialogTitle>
                <DialogDescription>{t("Choose the problem.")}</DialogDescription>
              </DialogHeader>
              <FieldSelect value={reason} onChange={setReason} options={reportReasons} />
              <DialogFooter>
                <SubmitButton>{t("Send report")}</SubmitButton>
              </DialogFooter>
            </ActionForm>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
