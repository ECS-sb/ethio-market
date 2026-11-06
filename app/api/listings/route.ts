import { NextResponse, type NextRequest } from "next/server";
import { getListingsByIds } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (ids.length === 0) return NextResponse.json([]);
  return NextResponse.json(await getListingsByIds(ids));
}
