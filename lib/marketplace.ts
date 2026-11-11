import { randomInt } from "node:crypto";
import { db } from "@/lib/db";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import type { MessageKey } from "@/lib/messages";

export type Actor = { id: string; isAdmin: boolean };

export class DomainError extends Error {
  constructor(readonly key: MessageKey) {
    super(key);
  }
}

// ዳታቤዙ ከአገልጋዩ ርቆ ወይም ከእንቅልፍ እየነቃ ሲሆን ነባሪው የ5 ሰከንድ ገደብ አይበቃም።
const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };

function assertAdmin(actor: Actor) {
  if (!actor.isAdmin) throw new DomainError("You don't have permission to do this.");
}

function generateVerificationCode(): string {
  return `EM-${randomInt(100000, 1000000)}`;
}

export type ListingInput = {
  platform: string;
  username: string;
  followers: number;
  posts?: number;
  priceEtb: number;
  category: string;
  country: string;
  femaleShare?: number;
  engagement?: number;
  joinedYear?: number;
  originalEmail: boolean;
  special: boolean;
  monetized?: boolean;
  strikeFree?: boolean;
  noAdsense?: boolean;
  description: string;
};

export type ListingImageInput = { data: Uint8Array<ArrayBuffer>; thumb: Uint8Array<ArrayBuffer>; width: number; height: number };

export async function createListing(actor: Actor, input: ListingInput, images: ListingImageInput[] = []) {
  const username = input.username.replace(/^@/, "").toLowerCase();
  const duplicate = await db.listing.findFirst({
    where: {
      platform: input.platform,
      username,
      status: { in: ["PENDING", "APPROVED", "IN_PROGRESS"] },
    },
    select: { id: true },
  });
  if (duplicate) throw new DomainError("This account is already on the market.");

  return db.listing.create({
    data: {
      ...input,
      username,
      sellerId: actor.id,
      verificationCode: generateVerificationCode(),
      images: { create: images.map((image, position) => ({ ...image, position })) },
    },
    select: { id: true, verificationCode: true },
  });
}

export async function updateListingPrice(actor: Actor, listingId: string, priceEtb: number) {
  const { count } = await db.listing.updateMany({
    where: { id: listingId, sellerId: actor.id, status: { in: ["PENDING", "APPROVED"] } },
    data: { priceEtb },
  });
  if (count !== 1) throw new DomainError("This listing's price can't be changed.");
}

export async function archiveListing(actor: Actor, listingId: string) {
  await db.$transaction(async (tx) => {
    const { count } = await tx.listing.updateMany({
      where: { id: listingId, sellerId: actor.id, status: { in: ["PENDING", "APPROVED", "REJECTED"] } },
      data: { status: "ARCHIVED" },
    });
    if (count !== 1) throw new DomainError("This listing can't be removed.");
    await tx.offer.updateMany({ where: { listingId, status: "PENDING" }, data: { status: "REJECTED" } });
  }, TX_OPTIONS);
}

/** ሻጩ አካውንቱን ከገበያው ውጭ ሲሸጥ "Sold out" ያደርገዋል፤ በስህተት ከሆነ መልሶ "Available" ያደርገዋል። */
export async function setListingAvailability(actor: Actor, listingId: string, available: boolean) {
  await db.$transaction(async (tx) => {
    if (!available) {
      const { count } = await tx.listing.updateMany({
        where: { id: listingId, sellerId: actor.id, status: "APPROVED" },
        data: { status: "SOLD" },
      });
      if (count !== 1) throw new DomainError("This listing's availability can't be changed.");
      await tx.offer.updateMany({ where: { listingId, status: "PENDING" }, data: { status: "REJECTED" } });
      return;
    }

    // በገበያው ትዕዛዝ ተጠናቆ የተሸጠ ማስታወቂያ ተመልሶ ሊከፈት አይችልም።
    const listing = await tx.listing.findFirst({
      where: { id: listingId, sellerId: actor.id, status: "SOLD", orders: { none: { status: "RELEASED" } } },
      select: { platform: true, username: true },
    });
    if (!listing) throw new DomainError("This listing's availability can't be changed.");
    const duplicate = await tx.listing.findFirst({
      where: { id: { not: listingId }, ...listing, status: { in: ["PENDING", "APPROVED", "IN_PROGRESS"] } },
      select: { id: true },
    });
    if (duplicate) throw new DomainError("This account is already on the market.");
    const { count } = await tx.listing.updateMany({
      where: { id: listingId, sellerId: actor.id, status: "SOLD" },
      data: { status: "APPROVED" },
    });
    if (count !== 1) throw new DomainError("This listing's availability can't be changed.");
  }, TX_OPTIONS);
}

export async function reviewListing(actor: Actor, listingId: string, approve: boolean, reason?: string) {
  assertAdmin(actor);
  const { count } = await db.listing.updateMany({
    where: { id: listingId, status: "PENDING" },
    data: approve ? { status: "APPROVED", rejectReason: null } : { status: "REJECTED", rejectReason: reason || null },
  });
  if (count !== 1) throw new DomainError("This listing has already been reviewed.");
}

export async function createOffer(actor: Actor, listingId: string, amountEtb: number, note: string) {
  const listing = await db.listing.findUnique({ where: { id: listingId }, select: { sellerId: true, status: true } });
  if (!listing || listing.status !== "APPROVED") throw new DomainError("This account isn't for sale right now.");
  if (listing.sellerId === actor.id) throw new DomainError("You can't make an offer on your own listing.");
  const existing = await db.offer.findFirst({
    where: { listingId, buyerId: actor.id, status: "PENDING" },
    select: { id: true },
  });
  if (existing) throw new DomainError("You already have an offer awaiting a reply on this account.");
  return db.offer.create({ data: { listingId, buyerId: actor.id, amountEtb, note }, select: { id: true } });
}

export async function withdrawOffer(actor: Actor, offerId: string) {
  const { count } = await db.offer.updateMany({
    where: { id: offerId, buyerId: actor.id, status: "PENDING" },
    data: { status: "WITHDRAWN" },
  });
  if (count !== 1) throw new DomainError("This offer can't be withdrawn.");
}

export async function rejectOffer(actor: Actor, offerId: string) {
  const { count } = await db.offer.updateMany({
    where: { id: offerId, status: "PENDING", listing: { sellerId: actor.id } },
    data: { status: "REJECTED" },
  });
  if (count !== 1) throw new DomainError("This offer can't be declined.");
}

export async function acceptOffer(actor: Actor, offerId: string) {
  return db.$transaction(async (tx) => {
    const offer = await tx.offer.findFirst({
      where: { id: offerId, status: "PENDING", listing: { sellerId: actor.id } },
      select: { id: true, listingId: true, buyerId: true, amountEtb: true },
    });
    if (!offer) throw new DomainError("This offer can't be accepted.");

    // አንድ ማስታወቂያ ለሁለት ገዢዎች እንዳይሸጥ የሁኔታ ለውጡ ራሱ ይጠብቃል።
    const { count } = await tx.listing.updateMany({
      where: { id: offer.listingId, status: "APPROVED", sellerId: actor.id },
      data: { status: "IN_PROGRESS" },
    });
    if (count !== 1) throw new DomainError("This account isn't for sale right now.");

    await tx.offer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } });
    await tx.offer.updateMany({
      where: { listingId: offer.listingId, status: "PENDING", id: { not: offer.id } },
      data: { status: "REJECTED" },
    });
    return tx.order.create({
      data: {
        listingId: offer.listingId,
        offerId: offer.id,
        buyerId: offer.buyerId,
        sellerId: actor.id,
        amountEtb: offer.amountEtb,
      },
      select: { id: true },
    });
  }, TX_OPTIONS);
}

async function moveOrder(where: { id: string; buyerId?: string; sellerId?: string }, from: OrderStatus[], to: OrderStatus) {
  const { count } = await db.order.updateMany({ where: { ...where, status: { in: from } }, data: { status: to } });
  if (count !== 1) throw new DomainError("This order can't be changed this way right now.");
}

export async function confirmPayment(actor: Actor, orderId: string) {
  assertAdmin(actor);
  await moveOrder({ id: orderId }, ["AWAITING_PAYMENT"], "PAID");
}

export async function markTransferred(actor: Actor, orderId: string) {
  await moveOrder({ id: orderId, sellerId: actor.id }, ["PAID"], "TRANSFERRED");
}

export async function confirmReceived(actor: Actor, orderId: string) {
  await moveOrder({ id: orderId, buyerId: actor.id }, ["TRANSFERRED"], "CONFIRMED");
}

export async function openDispute(actor: Actor, orderId: string) {
  const { count } = await db.order.updateMany({
    where: {
      id: orderId,
      status: { in: ["PAID", "TRANSFERRED"] },
      OR: [{ buyerId: actor.id }, { sellerId: actor.id }],
    },
    data: { status: "DISPUTED" },
  });
  if (count !== 1) throw new DomainError("A dispute can't be opened for this order.");
}

export async function releaseOrder(actor: Actor, orderId: string) {
  assertAdmin(actor);
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, select: { listingId: true } });
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["CONFIRMED", "DISPUTED"] } },
      data: { status: "RELEASED" },
    });
    if (!order || count !== 1) throw new DomainError("This order can't be completed.");
    await tx.listing.update({ where: { id: order.listingId }, data: { status: "SOLD" } });
  }, TX_OPTIONS);
}

export async function cancelOrder(actor: Actor, orderId: string) {
  assertAdmin(actor);
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, select: { listingId: true } });
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["AWAITING_PAYMENT", "PAID", "TRANSFERRED", "DISPUTED"] } },
      data: { status: "CANCELLED" },
    });
    if (!order || count !== 1) throw new DomainError("This order can't be cancelled.");
    await tx.listing.update({ where: { id: order.listingId }, data: { status: "APPROVED" } });
  }, TX_OPTIONS);
}

export async function startConversation(actor: Actor, listingId: string) {
  const listing = await db.listing.findUnique({ where: { id: listingId }, select: { sellerId: true, status: true } });
  if (!listing || !["APPROVED", "IN_PROGRESS"].includes(listing.status)) {
    throw new DomainError("This account isn't available right now.");
  }
  if (listing.sellerId === actor.id) throw new DomainError("This is your listing.");
  return db.conversation.upsert({
    where: { listingId_buyerId: { listingId, buyerId: actor.id } },
    create: { listingId, buyerId: actor.id },
    update: {},
    select: { id: true },
  });
}

export async function sendMessage(actor: Actor, conversationId: string, body: string) {
  const conversation = await db.conversation.findFirst({
    where: { id: conversationId, OR: [{ buyerId: actor.id }, { listing: { sellerId: actor.id } }] },
    select: { id: true },
  });
  if (!conversation) throw new DomainError("This conversation couldn't be found.");
  await db.$transaction([
    db.message.create({ data: { conversationId, senderId: actor.id, body } }),
    db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
  ]);
}

export async function createReport(actor: Actor, listingId: string, reason: string) {
  const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true } });
  if (!listing) throw new DomainError("Listing not found.");
  await db.report.upsert({
    where: { listingId_reporterId: { listingId, reporterId: actor.id } },
    create: { listingId, reporterId: actor.id, reason },
    update: { reason, resolved: false },
  });
}

export async function resolveReport(actor: Actor, reportId: string) {
  assertAdmin(actor);
  await db.report.update({ where: { id: reportId }, data: { resolved: true } });
}

export async function resolveContactMessage(actor: Actor, id: string) {
  assertAdmin(actor);
  await db.contactMessage.update({ where: { id }, data: { resolved: true } });
}

export async function setUserFlags(actor: Actor, userId: string, flags: { suspended?: boolean; verifiedSeller?: boolean }) {
  assertAdmin(actor);
  if (flags.suspended !== undefined && userId === actor.id) throw new DomainError("You can't suspend your own account.");
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: flags });
    if (flags.suspended) await tx.session.deleteMany({ where: { userId } });
  }, TX_OPTIONS);
}

export async function updateProfile(actor: Actor, phone: string | null) {
  await db.user.update({ where: { id: actor.id }, data: { phone } });
}
