"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, getListing, myOffers } from "@/lib/data";

type Decision = "accepted" | "rejected";

export function OffersList() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  return (
    <ul className="flex flex-col gap-6">
      {myOffers.map((offer) => {
        const listing = getListing(offer.listingId);
        const decision = decisions[offer.id];
        return (
          <li key={offer.id} className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-card/70 p-6 ring-1 ring-foreground/10">
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{formatPrice(offer.amount)}</p>
              <p className="text-sm text-muted-foreground">
                <span dir="ltr">@{listing?.handle}</span> · {offer.buyer} · {offer.age}
              </p>
              {listing ? <p className="text-xs text-muted-foreground">የተጠየቀ ዋጋ፦ {formatPrice(listing.price)}</p> : null}
            </div>
            {decision ? (
              <Badge variant={decision === "accepted" ? "default" : "secondary"}>
                {decision === "accepted" ? "ተቀብለዋል (ማሳያ)" : "አልተቀበሉም (ማሳያ)"}
              </Badge>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDecisions((current) => ({ ...current, [offer.id]: "rejected" }))}>
                  አልቀበልም
                </Button>
                <Button onClick={() => setDecisions((current) => ({ ...current, [offer.id]: "accepted" }))}>እቀበላለሁ</Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
