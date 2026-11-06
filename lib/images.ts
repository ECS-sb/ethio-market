import "server-only";
import sharp from "sharp";
import { DomainError, type ListingImageInput } from "@/lib/marketplace";

const FULL_WIDTH = 1200;
const FULL_HEIGHT = 1600;
const THUMB_WIDTH = 640;
const MAX_INPUT_PIXELS = 24_000_000;
const ALLOWED_FORMATS = ["jpeg", "png", "webp"];

/** ስክሪንሾቱን ወደ WebP ይቀይራል። sharp ሜታዳታውን (EXIF፣ አካባቢ) በነባሪ ያጠፋል። */
export async function optimizeScreenshot(file: File): Promise<ListingImageInput> {
  const input = Buffer.from(await file.arrayBuffer());
  try {
    const source = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS });
    const { format } = await source.metadata();
    if (!format || !ALLOWED_FORMATS.includes(format)) throw new DomainError("This image couldn't be read. Use a JPG, PNG or WebP file.");

    const upright = source.rotate();
    const full = await upright
      .clone()
      .resize({ width: FULL_WIDTH, height: FULL_HEIGHT, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
    const thumb = await upright.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();

    return { data: new Uint8Array(full.data), thumb: new Uint8Array(thumb), width: full.info.width, height: full.info.height };
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError("This image couldn't be read. Use a JPG, PNG or WebP file.");
  }
}
