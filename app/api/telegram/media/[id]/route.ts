import { getCurrentUser } from "@/lib/session";
import { loadMedia } from "@/lib/telegram/media";
import { canShowInline } from "@/lib/telegram/media-kind";

/**
 * የቴሌግራም ፎቶ/ቪዲዮ/ድምጽ ለአድሚን ብቻ። ቦቱ ፋይሉን ራሱ ያወርዳል፤ የቦቱ token ወደ ብራውዘሩ አይደርስም።
 * ?full=1 ኦሪጅናሉን ከቴሌግራም ይጠይቃል።
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return new Response(null, { status: 404 });
  const { id } = await params;
  const full = new URL(request.url).searchParams.get("full") === "1";
  const media = await loadMedia(id, full);
  if (!media) return new Response(null, { status: 404 });

  const inline = canShowInline(media.mimeType);
  return new Response(media.bytes, {
    headers: {
      // የደንበኛ ፋይል HTML ወይም SVG ከሆነ በገጹ ውስጥ እንዳይሮጥ እንደ ማውረጃ ይላካል።
      "Content-Type": inline ? media.mimeType : "application/octet-stream",
      "Content-Disposition": inline ? "inline" : "attachment",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
