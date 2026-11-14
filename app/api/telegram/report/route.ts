import type { NextRequest } from "next/server";
import { sendDailyReport } from "@/lib/telegram/report";

/** Vercel Cron በየቀኑ ይጠራዋል (vercel.json)፤ CRON_SECRET በAuthorization header ይመጣል። */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response(null, { status: 401 });
  const sent = await sendDailyReport();
  return Response.json({ sent });
}
