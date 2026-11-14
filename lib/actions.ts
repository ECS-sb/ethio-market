"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { categories, countries, MAX_SCREENSHOT_BYTES, MAX_SCREENSHOTS, platforms, reportReasons } from "@/lib/catalog";
import { db } from "@/lib/db";
import { localePath } from "@/lib/i18n";
import { optimizeScreenshot } from "@/lib/images";
import * as market from "@/lib/marketplace";
import type { MessageKey } from "@/lib/messages";
import { requestLocale, requireAdmin, requireUser } from "@/lib/session";
import { aiEnabled } from "@/lib/telegram/ai";
import { analyzeChat, analyzePending } from "@/lib/telegram/analyze";
import { sendAlertNotifications } from "@/lib/telegram/report";

export type ActionResult = { ok: boolean; message: MessageKey; code?: string; id?: string };

const inList = (options: { value: string }[]) => z.string().refine((value) => options.some((option) => option.value === value));
const id = z.string().min(1).max(64);
const money = z.coerce.number().int().min(1).max(1_000_000_000);
const optionalNumber = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" || value === null || value === undefined ? undefined : value), schema.optional());

const INVALID: ActionResult = { ok: false, message: "Check what you entered and try again." };

async function run(message: MessageKey, work: () => Promise<Partial<ActionResult> | void>): Promise<ActionResult> {
  try {
    const extra = await work();
    revalidatePath("/", "layout");
    return { ok: true, message, ...(extra ?? {}) };
  } catch (error) {
    if (error instanceof market.DomainError) return { ok: false, message: error.key };
    console.error(error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

const field = (data: FormData, name: string) => data.get(name) ?? undefined;

const listingSchema = z.object({
  platform: z.string().refine((value) => platforms.some((platform) => platform.id === value)),
  username: z.string().trim().regex(/^@?[A-Za-z0-9._-]{1,60}$/),
  followers: z.coerce.number().int().min(0).max(5_000_000_000),
  posts: optionalNumber(z.coerce.number().int().min(0).max(100_000_000)),
  priceEtb: money,
  category: inList(categories),
  country: inList(countries),
  femaleShare: optionalNumber(z.coerce.number().int().min(0).max(100)),
  engagement: optionalNumber(z.coerce.number().min(0).max(100)),
  joinedYear: optionalNumber(z.coerce.number().int().min(2004).max(new Date().getFullYear())),
  description: z.string().trim().max(2000).default(""),
});

export async function createListingAction(data: FormData): Promise<ActionResult> {
  const user = await requireUser("/sell");
  const parsed = listingSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return INVALID;
  const originalEmail = data.get("originalEmail") === "on";
  const special = data.get("special") === "on";
  const isYoutube = parsed.data.platform === "youtube";
  const youtube = {
    monetized: isYoutube && data.get("monetized") === "on",
    strikeFree: isYoutube && data.get("strikeFree") === "on",
    noAdsense: isYoutube && data.get("noAdsense") === "on",
  };

  const screenshots = data.getAll("screenshots").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (screenshots.length < 1 || screenshots.length > MAX_SCREENSHOTS) return { ok: false, message: "Add 1 to 4 screenshots." };
  if (screenshots.some((file) => file.size > MAX_SCREENSHOT_BYTES)) return { ok: false, message: "This image is too large." };

  return run("Your listing was sent for review.", async () => {
    const images = await Promise.all(screenshots.map(optimizeScreenshot));
    const created = await market.createListing(user, { ...parsed.data, originalEmail, special, ...youtube }, images);
    return { code: created.verificationCode, id: created.id };
  });
}

export async function updatePriceAction(data: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z.object({ id, priceEtb: money }).safeParse({ id: field(data, "id"), priceEtb: field(data, "priceEtb") });
  if (!parsed.success) return INVALID;
  return run("Price updated.", () => market.updateListingPrice(user, parsed.data.id, parsed.data.priceEtb));
}

export async function archiveListingAction(data: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = id.safeParse(field(data, "id"));
  if (!parsed.success) return INVALID;
  return run("Listing removed.", () => market.archiveListing(user, parsed.data));
}

export async function setAvailabilityAction(data: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z
    .object({ id, available: z.enum(["true", "false"]) })
    .safeParse({ id: field(data, "id"), available: field(data, "available") });
  if (!parsed.success) return INVALID;
  const available = parsed.data.available === "true";
  return run(available ? "Marked as available." : "Marked as sold out.", () =>
    market.setListingAvailability(user, parsed.data.id, available)
  );
}

export async function createOfferAction(data: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z
    .object({ listingId: id, amountEtb: money, note: z.string().trim().max(500).default("") })
    .safeParse({ listingId: field(data, "listingId"), amountEtb: field(data, "amountEtb"), note: field(data, "note") });
  if (!parsed.success) return INVALID;
  return run("Your offer was sent to the seller.", async () => {
    await market.createOffer(user, parsed.data.listingId, parsed.data.amountEtb, parsed.data.note);
  });
}

function offerAction(message: MessageKey, work: (actor: market.Actor, offerId: string) => Promise<unknown>) {
  return async (data: FormData): Promise<ActionResult> => {
    const user = await requireUser();
    const parsed = id.safeParse(field(data, "id"));
    if (!parsed.success) return INVALID;
    return run(message, async () => {
      await work(user, parsed.data);
    });
  };
}

const withdrawOfferImpl = offerAction("Offer withdrawn.", market.withdrawOffer);
const rejectOfferImpl = offerAction("Offer declined.", market.rejectOffer);
const acceptOfferImpl = offerAction("Offer accepted. An order was opened.", market.acceptOffer);
const markTransferredImpl = offerAction("Transfer recorded.", market.markTransferred);
const confirmReceivedImpl = offerAction("Handover confirmed.", market.confirmReceived);
const openDisputeImpl = offerAction("Dispute opened. An admin will review it.", market.openDispute);

export async function withdrawOfferAction(data: FormData) {
  return withdrawOfferImpl(data);
}
export async function rejectOfferAction(data: FormData) {
  return rejectOfferImpl(data);
}
export async function acceptOfferAction(data: FormData) {
  return acceptOfferImpl(data);
}
export async function markTransferredAction(data: FormData) {
  return markTransferredImpl(data);
}
export async function confirmReceivedAction(data: FormData) {
  return confirmReceivedImpl(data);
}
export async function openDisputeAction(data: FormData) {
  return openDisputeImpl(data);
}

export async function startConversationAction(data: FormData): Promise<ActionResult> {
  const listingId = id.safeParse(field(data, "listingId"));
  if (!listingId.success) return INVALID;
  const user = await requireUser(`/accounts/${listingId.data}`);
  let conversationId: string;
  try {
    conversationId = (await market.startConversation(user, listingId.data)).id;
  } catch (error) {
    if (error instanceof market.DomainError) return { ok: false, message: error.key };
    throw error;
  }
  redirect(localePath(await requestLocale(), `/dashboard/messages/${conversationId}`));
}

export async function sendMessageAction(data: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z
    .object({ conversationId: id, body: z.string().trim().min(1).max(2000) })
    .safeParse({ conversationId: field(data, "conversationId"), body: field(data, "body") });
  if (!parsed.success) return INVALID;
  return run("Sent.", () => market.sendMessage(user, parsed.data.conversationId, parsed.data.body));
}

export async function createReportAction(data: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z
    .object({ listingId: id, reason: inList(reportReasons) })
    .safeParse({ listingId: field(data, "listingId"), reason: field(data, "reason") });
  if (!parsed.success) return INVALID;
  return run("We received your report.", () => market.createReport(user, parsed.data.listingId, parsed.data.reason));
}

export async function createContactAction(data: FormData): Promise<ActionResult> {
  if (data.get("website")) return { ok: true, message: "We received your message." };
  const parsed = z
    .object({ name: z.string().trim().min(1).max(100), email: z.email().max(200), body: z.string().trim().min(1).max(2000) })
    .safeParse({ name: field(data, "name"), email: field(data, "email"), body: field(data, "body") });
  if (!parsed.success) return INVALID;
  return run("We received your message.", async () => {
    await db.contactMessage.create({ data: parsed.data });
  });
}

export async function updateProfileAction(data: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = z
    .string()
    .trim()
    .regex(/^[+0-9 ()-]{0,20}$/)
    .safeParse(field(data, "phone") ?? "");
  if (!parsed.success) return INVALID;
  return run("Saved.", () => market.updateProfile(user, parsed.data || null));
}

// ---- አድሚን

function adminAction(message: MessageKey, work: (actor: market.Actor, targetId: string) => Promise<unknown>) {
  return async (data: FormData): Promise<ActionResult> => {
    const admin = await requireAdmin();
    const parsed = id.safeParse(field(data, "id"));
    if (!parsed.success) return INVALID;
    return run(message, async () => {
      await work(admin, parsed.data);
    });
  };
}

const approveListingImpl = adminAction("Listing approved.", (actor, target) => market.reviewListing(actor, target, true));
const confirmPaymentImpl = adminAction("Payment confirmed.", market.confirmPayment);
const releaseOrderImpl = adminAction("Order completed.", market.releaseOrder);
const cancelOrderImpl = adminAction("Order cancelled.", market.cancelOrder);
const resolveReportImpl = adminAction("Resolved.", market.resolveReport);
const resolveContactImpl = adminAction("Resolved.", market.resolveContactMessage);
const resolveTelegramAlertImpl = adminAction("Resolved.", async (_actor, target) => {
  await db.telegramAlert.update({ where: { id: target }, data: { resolved: true } });
});

export async function approveListingAction(data: FormData) {
  return approveListingImpl(data);
}
export async function confirmPaymentAction(data: FormData) {
  return confirmPaymentImpl(data);
}
export async function releaseOrderAction(data: FormData) {
  return releaseOrderImpl(data);
}
export async function cancelOrderAction(data: FormData) {
  return cancelOrderImpl(data);
}
export async function resolveReportAction(data: FormData) {
  return resolveReportImpl(data);
}
export async function resolveContactAction(data: FormData) {
  return resolveContactImpl(data);
}
export async function resolveTelegramAlertAction(data: FormData) {
  return resolveTelegramAlertImpl(data);
}

const AI_NOT_SET_UP: ActionResult = { ok: false, message: "AI analysis is not set up yet." };

export async function analyzeTelegramChatAction(data: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!aiEnabled()) return AI_NOT_SET_UP;
  const parsed = id.safeParse(field(data, "id"));
  if (!parsed.success) return INVALID;
  return run("Analysis finished.", async () => {
    await analyzeChat(parsed.data);
  });
}

export async function analyzePendingTelegramAction(): Promise<ActionResult> {
  await requireAdmin();
  if (!aiEnabled()) return AI_NOT_SET_UP;
  return run("Analysis finished.", async () => {
    const result = await analyzePending({ receipts: 10, chats: 8 });
    if (result.alerts.length > 0) await sendAlertNotifications(result.alerts);
  });
}

export async function rejectListingAction(data: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z
    .object({ id, reason: z.string().trim().max(300).default("") })
    .safeParse({ id: field(data, "id"), reason: field(data, "reason") });
  if (!parsed.success) return INVALID;
  return run("Listing rejected.", () => market.reviewListing(admin, parsed.data.id, false, parsed.data.reason));
}

export async function setUserFlagAction(data: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z
    .object({ id, flag: z.enum(["suspended", "verifiedSeller"]), value: z.enum(["true", "false"]) })
    .safeParse({ id: field(data, "id"), flag: field(data, "flag"), value: field(data, "value") });
  if (!parsed.success) return INVALID;
  return run("Updated.", () =>
    market.setUserFlags(admin, parsed.data.id, { [parsed.data.flag]: parsed.data.value === "true" })
  );
}
