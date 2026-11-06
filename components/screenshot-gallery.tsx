"use client";

import Image from "next/image";
import { XIcon } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Screenshot = { id: string; width: number; height: number };

export function ScreenshotGallery({ images }: { images: Screenshot[] }) {
  const t = useT();
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {images.map((image, index) => {
        const label = t("Screenshot {number}", { number: index + 1 });
        return (
          <Dialog key={image.id}>
            <DialogTrigger
              aria-label={label}
              className="overflow-hidden rounded-xl bg-secondary ring-1 ring-foreground/10 transition-all hover:ring-primary/60"
            >
              <Image
                unoptimized
                src={`/api/listing-images/${image.id}?size=thumb`}
                alt={label}
                width={image.width}
                height={image.height}
                className="aspect-[4/3] w-full object-contain"
              />
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
              <div className="flex items-center justify-between gap-4">
                <DialogTitle>{label}</DialogTitle>
                <DialogClose render={<Button variant="ghost" size="icon-sm" aria-label={t("Close")} />}>
                  <XIcon />
                </DialogClose>
              </div>
              <Image unoptimized src={`/api/listing-images/${image.id}`} alt={label} width={image.width} height={image.height} className="h-auto w-full rounded-xl" />
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
