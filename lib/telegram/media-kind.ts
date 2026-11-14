// መልዕክቱ ምን አይነት ሚዲያ እንደያዘ፤ በገጹ ላይ እንዴት እንደሚታይ ለመወሰን። ምንም database አይጠቀምም።

export type MediaKind = "image" | "video" | "audio" | "file" | "other";

const INLINE_IMAGE = /^image\/(jpeg|png|webp|gif)$/;

export function mediaKind(mediaType: string | null, mimeType: string | null): MediaKind {
  if (mediaType === "photo") return "image";
  if (mediaType === "document") return INLINE_IMAGE.test(mimeType ?? "") ? "image" : "file";
  if (mediaType === "video" || mediaType === "video_note") return "video";
  if (mediaType === "voice" || mediaType === "audio") return "audio";
  return "other";
}

/** በገጹ ውስጥ በቀጥታ ሊታዩ የሚችሉ የፋይል አይነቶች፤ ሌሎቹ (ለምሳሌ HTML ወይም SVG) እንደ ማውረጃ ብቻ ይላካሉ። */
const INLINE_TYPES = /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime)|audio\/(ogg|mpeg|mp4|aac|x-m4a|wav|webm)|application\/pdf)$/;

export function canShowInline(mimeType: string): boolean {
  return INLINE_TYPES.test(mimeType);
}

export function defaultMimeType(mediaType: string | null): string {
  switch (mediaType) {
    case "photo":
      return "image/jpeg";
    case "video":
    case "video_note":
      return "video/mp4";
    case "voice":
      return "audio/ogg";
    case "audio":
      return "audio/mpeg";
    default:
      return "application/octet-stream";
  }
}
