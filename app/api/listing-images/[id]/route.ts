import { getListingImage } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const variant = new URL(request.url).searchParams.get("size") === "thumb" ? "thumb" : "full";
  const image = await getListingImage(id, variant, getCurrentUser);
  if (!image) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": "image/webp",
      "X-Content-Type-Options": "nosniff",
      // ያልጸደቀ ማስታወቂያ ምስል በጋራ ካሽ ውስጥ መቀመጥ የለበትም።
      "Cache-Control": image.isPublic ? "public, max-age=3600, s-maxage=86400" : "private, no-store",
    },
  });
}
