import "server-only";
import sharp from "sharp";
import { db } from "@/lib/db";
import { downloadTelegramFile } from "@/lib/telegram/api";
import { defaultMimeType, mediaKind } from "@/lib/telegram/media-kind";

/** ቦቱ ከቴሌግራም ማውረድ የሚችለው እስከ 20MB ብቻ ነው። */
const MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024;
const COPY_SIZE = 1280;
const MAX_INPUT_PIXELS = 40_000_000;

/** ፎቶውን ወደ ትንሽ WebP ቀይሮ ያስቀምጣል (ቀድሞ ካለ አይደግምም)። ምስሉን ማንበብ ካልተቻለ null ይመልሳል። */
async function storeCopy(messageId: string, original: Buffer) {
  try {
    const { data, info } = await sharp(original, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize({ width: COPY_SIZE, height: COPY_SIZE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer({ resolveWithObject: true });
    return await db.telegramMediaFile.upsert({
      where: { messageId },
      create: { messageId, mimeType: "image/webp", width: info.width, height: info.height, data: new Uint8Array(data) },
      update: {},
      select: { data: true, mimeType: true },
    });
  } catch (error) {
    console.warn(`telegram media: could not store a copy for ${messageId}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/** መልዕክቱ ሲመጣ (webhook) የፎቶውን ቅጂ ያስቀምጣል፤ በኋላ ቢሰረዝም ማስረጃው ይቀራል። */
export async function storeMediaCopies(messageRowIds: string[]) {
  for (const id of messageRowIds) {
    try {
      const message = await db.telegramMessage.findUnique({
        where: { id },
        select: { id: true, fileId: true, mediaType: true, mimeType: true, mediaFile: { select: { id: true } } },
      });
      if (!message?.fileId || message.mediaFile || mediaKind(message.mediaType, message.mimeType) !== "image") continue;
      const original = await downloadTelegramFile(message.fileId, MAX_DOWNLOAD_BYTES);
      if (original) await storeCopy(message.id, original);
    } catch (error) {
      console.warn(`telegram media: copy for ${id} failed:`, error instanceof Error ? error.message : error);
    }
  }
}

export type LoadedMedia = { bytes: Uint8Array<ArrayBuffer>; mimeType: string };

/**
 * ለአድሚን ገጽ፦ ፎቶ ከሆነና ቅጂ ካለ ቅጂው (ፈጣን)፤ ካልሆነ ከቴሌግራም ይወርዳል።
 * full=true ሙሉውን ኦሪጅናል ከቴሌግራም ይሞክራል። ቴሌግራም ካልሰጠ (ለምሳሌ ተሰርዟል) ያለው ቅጂ ይላካል።
 */
export async function loadMedia(messageRowId: string, full: boolean): Promise<LoadedMedia | null> {
  const message = await db.telegramMessage.findUnique({
    where: { id: messageRowId },
    select: { id: true, fileId: true, mediaType: true, mimeType: true, mediaFile: { select: { data: true, mimeType: true } } },
  });
  if (!message?.fileId) return null;
  const isImage = mediaKind(message.mediaType, message.mimeType) === "image";
  const stored = message.mediaFile ? { bytes: new Uint8Array(message.mediaFile.data), mimeType: message.mediaFile.mimeType } : null;
  if (isImage && stored && !full) return stored;

  try {
    const original = await downloadTelegramFile(message.fileId, MAX_DOWNLOAD_BYTES);
    if (original) {
      if (isImage && !stored) await storeCopy(message.id, original);
      return { bytes: new Uint8Array(original), mimeType: message.mimeType ?? defaultMimeType(message.mediaType) };
    }
  } catch (error) {
    console.warn(`telegram media: download for ${message.id} failed:`, error instanceof Error ? error.message : error);
  }
  return stored;
}
