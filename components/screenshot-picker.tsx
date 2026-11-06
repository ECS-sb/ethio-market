"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { MAX_SCREENSHOT_BYTES, MAX_SCREENSHOTS } from "@/lib/catalog";

const MAX_SIDE = 1600;
const QUALITIES = [0.88, 0.7, 0.5];

/** ምስሉ ወደ አገልጋይ ከመላኩ በፊት በስልኩ ላይ ይቀንሳል፣ ሜታዳታውም ይጠፋል። */
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of QUALITIES) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= MAX_SCREENSHOT_BYTES) return new File([blob], "screenshot.jpg", { type: "image/jpeg" });
  }
  throw new Error("too large");
}

function Preview({ file, alt }: { file: File; alt: string }) {
  const src = useMemo(() => URL.createObjectURL(file), [file]);
  return <Image unoptimized src={src} alt={alt} width={320} height={240} className="aspect-[4/3] w-full object-cover object-top" />;
}

export function ScreenshotPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [working, setWorking] = useState(false);

  const add = async (picked: File[]) => {
    if (files.length + picked.length > MAX_SCREENSHOTS) toast.error(t("You can add up to {max} screenshots.", { max: MAX_SCREENSHOTS }));
    setWorking(true);
    const added: File[] = [];
    for (const file of picked.slice(0, MAX_SCREENSHOTS - files.length)) {
      try {
        added.push(await shrink(file));
      } catch {
        toast.error(t("This image couldn't be read. Use a JPG, PNG or WebP file."));
      }
    }
    setWorking(false);
    onChange([...files, ...added]);
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={input}
        id="screenshots"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label={t("Add screenshots")}
        onChange={(event) => {
          void add(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      {files.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {files.map((file, index) => (
            <li key={`${index}-${file.size}`} className="relative overflow-hidden rounded-xl bg-secondary ring-1 ring-foreground/10">
              <Preview file={file} alt={t("Screenshot {number}", { number: index + 1 })} />
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute top-2 right-2"
                aria-label={t("Remove screenshot {number}", { number: index + 1 })}
                onClick={() => onChange(files.filter((_, position) => position !== index))}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <Button type="button" variant="outline" className="w-fit" disabled={working || files.length >= MAX_SCREENSHOTS} onClick={() => input.current?.click()}>
        <ImagePlusIcon data-icon="inline-start" />
        {working ? t("Optimizing…") : t("Add screenshots")}
      </Button>
    </div>
  );
}
