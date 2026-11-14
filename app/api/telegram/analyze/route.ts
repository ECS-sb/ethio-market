import type { NextRequest } from "next/server";
import { analyzePending } from "@/lib/telegram/analyze";
import { sendAlertNotifications } from "@/lib/telegram/report";

export const maxDuration = 300;

/** Vercel Cron ከዕለታዊው ሪፖርት በፊት ይጠራዋል (vercel.json)፤ አዲስ መልዕክት ያላቸውን ቻቶች Claude ይተነትናል። */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response(null, { status: 401 });
  const result = await analyzePending();
  if (result.alerts.length > 0) await sendAlertNotifications(result.alerts);
  return Response.json({ receipts: result.receipts, chats: result.chats, alerts: result.alerts.length });
}
