import "server-only";
import { db } from "@/lib/db";
import type { ListingStatusValue } from "@/lib/catalog";
import { followerRanges, priceRanges } from "@/lib/catalog";
import type { Prisma } from "@/lib/generated/prisma/client";

const PUBLIC_STATUSES: ListingStatusValue[] = ["APPROVED", "IN_PROGRESS", "SOLD"];

// ኢሜይል፣ የማረጋገጫ ኮድ እና ሙሉ የአካውንት ስም እዚህ አይካተቱም። ስሙ ለtoPublic ብቻ ይነበባል።
const publicSelect = {
  id: true,
  platform: true,
  username: true,
  followers: true,
  posts: true,
  priceEtb: true,
  category: true,
  country: true,
  femaleShare: true,
  engagement: true,
  joinedYear: true,
  originalEmail: true,
  special: true,
  description: true,
  status: true,
  createdAt: true,
  sellerId: true,
  seller: { select: { name: true, verifiedSeller: true, createdAt: true } },
} satisfies Prisma.ListingSelect;

type PublicRow = Prisma.ListingGetPayload<{ select: typeof publicSelect }>;

export function maskUsername(username: string): string {
  return `***${username.slice(-Math.min(3, Math.max(1, username.length - 2)))}`;
}

export function publicSellerName(name: string): string {
  const [first, second] = name.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}

function toPublic(row: PublicRow) {
  const { username, seller, ...rest } = row;
  return {
    ...rest,
    handle: row.special ? username : maskUsername(username),
    sellerName: publicSellerName(seller.name),
    sellerVerified: seller.verifiedSeller,
    sellerSince: seller.createdAt.getFullYear(),
  };
}

export type PublicListing = ReturnType<typeof toPublic>;

export type ListingFilters = {
  q?: string;
  platform?: string;
  category?: string;
  country?: string;
  followers?: string;
  price?: string;
  seller?: string;
  verified?: boolean;
  special?: boolean;
  sort?: string;
  page?: number;
};

export const PAGE_SIZE = 24;

function rangeFilter(ranges: typeof followerRanges, value?: string): Prisma.IntFilter | undefined {
  const range = ranges.find((item) => item.value === value);
  if (!range) return undefined;
  return { gte: range.min, ...(range.max === null ? {} : { lt: range.max }) };
}

function orderFor(sort?: string): Prisma.ListingOrderByWithRelationInput {
  if (sort === "price-asc") return { priceEtb: "asc" };
  if (sort === "price-desc") return { priceEtb: "desc" };
  if (sort === "followers-desc") return { followers: "desc" };
  return { createdAt: "desc" };
}

export async function searchListings(filters: ListingFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const q = filters.q?.trim();
  const where: Prisma.ListingWhereInput = {
    status: "APPROVED",
    platform: filters.platform || undefined,
    category: filters.category || undefined,
    country: filters.country || undefined,
    sellerId: filters.seller || undefined,
    special: filters.special ? true : undefined,
    seller: { suspended: false, ...(filters.verified ? { verifiedSeller: true } : {}) },
    followers: rangeFilter(followerRanges, filters.followers),
    priceEtb: rangeFilter(priceRanges, filters.price),
    // የተደበቀ ስም በፍለጋ እንዳይገመት በስም መፈለግ የሚቻለው ለልዩ ስሞች ብቻ ነው።
    ...(q
      ? {
          OR: [
            { description: { contains: q, mode: "insensitive" as const } },
            { platform: { contains: q, mode: "insensitive" as const } },
            { special: true, username: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    db.listing.findMany({ where, select: publicSelect, orderBy: orderFor(filters.sort), skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.listing.count({ where }),
  ]);
  return { items: rows.map(toPublic), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getFeaturedListings(take = 6) {
  const rows = await db.listing.findMany({
    where: { status: "APPROVED", seller: { suspended: false } },
    select: publicSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toPublic);
}

export async function getPlatformCounts(): Promise<Record<string, number>> {
  const groups = await db.listing.groupBy({
    by: ["platform"],
    where: { status: "APPROVED", seller: { suspended: false } },
    _count: { _all: true },
  });
  return Object.fromEntries(groups.map((group) => [group.platform, group._count._all]));
}

/** ለሕዝብ የሚታይ ማስታወቂያ፣ ወይም ለባለቤቱ/ለአድሚን ገና ያልጸደቀ ማስታወቂያ። */
export async function getListingForViewer(id: string, viewer: { id: string; isAdmin: boolean } | null) {
  const row = await db.listing.findUnique({ where: { id }, select: publicSelect });
  if (!row) return null;
  const isOwner = viewer?.id === row.sellerId;
  if (!PUBLIC_STATUSES.includes(row.status) && !isOwner && !viewer?.isAdmin) return null;
  return { listing: toPublic(row), isOwner };
}

export async function getSimilarListings(listing: PublicListing, take = 3) {
  const rows = await db.listing.findMany({
    where: {
      id: { not: listing.id },
      status: "APPROVED",
      seller: { suspended: false },
      OR: [{ category: listing.category }, { platform: listing.platform }],
    },
    select: publicSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toPublic);
}

export async function getListingsByIds(ids: string[]) {
  const rows = await db.listing.findMany({
    where: { id: { in: ids }, status: { in: PUBLIC_STATUSES } },
    select: publicSelect,
  });
  return rows.map(toPublic);
}

export async function getSoldListings(take = 24) {
  const rows = await db.listing.findMany({ where: { status: "SOLD" }, select: publicSelect, orderBy: { updatedAt: "desc" }, take });
  return rows.map(toPublic);
}

export async function getTopSellers(take = 12) {
  const deals = await db.order.groupBy({
    by: ["sellerId"],
    where: { status: "RELEASED", seller: { suspended: false } },
    _count: { _all: true },
    orderBy: { _count: { sellerId: "desc" } },
    take,
  });
  const ids = deals.map((deal) => deal.sellerId);
  const [users, active] = await Promise.all([
    db.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, verifiedSeller: true, createdAt: true } }),
    db.listing.groupBy({ by: ["sellerId"], where: { sellerId: { in: ids }, status: "APPROVED" }, _count: { _all: true } }),
  ]);
  return deals.flatMap((deal) => {
    const user = users.find((item) => item.id === deal.sellerId);
    if (!user) return [];
    return [
      {
        id: user.id,
        name: publicSellerName(user.name),
        verified: user.verifiedSeller,
        since: user.createdAt.getFullYear(),
        deals: deal._count._all,
        activeListings: active.find((item) => item.sellerId === user.id)?._count._all ?? 0,
      },
    ];
  });
}

export async function getSellerDealCount(sellerId: string) {
  return db.order.count({ where: { sellerId, status: "RELEASED" } });
}

// ---- የገዢ ዳሽቦርድ

const orderInclude = {
  listing: { select: { id: true, platform: true, username: true, special: true } },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function orderView(row: OrderRow, revealUsername: boolean) {
  const { listing, ...order } = row;
  return {
    ...order,
    listingId: listing.id,
    platform: listing.platform,
    handle: revealUsername || listing.special ? listing.username : maskUsername(listing.username),
  };
}

export type OrderView = ReturnType<typeof orderView>;

export async function getBuyerOffers(userId: string) {
  const rows = await db.offer.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { id: true, platform: true, username: true, special: true, priceEtb: true } } },
  });
  return rows.map(({ listing, ...offer }) => ({
    ...offer,
    listingId: listing.id,
    platform: listing.platform,
    askingEtb: listing.priceEtb,
    handle: listing.special ? listing.username : maskUsername(listing.username),
  }));
}

export async function getBuyerOrders(userId: string) {
  const rows = await db.order.findMany({ where: { buyerId: userId }, orderBy: { createdAt: "desc" }, include: orderInclude });
  // ሙሉ ስሙ ለገዢው የሚታየው ክፍያው ከተረጋገጠ በኋላ ብቻ ነው።
  return rows.map((row) => orderView(row, !["AWAITING_PAYMENT", "CANCELLED"].includes(row.status)));
}

// ---- የሻጭ ዳሽቦርድ

export async function getSellerListings(userId: string) {
  return db.listing.findMany({
    where: { sellerId: userId, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      platform: true,
      username: true,
      priceEtb: true,
      followers: true,
      status: true,
      verificationCode: true,
      rejectReason: true,
      _count: { select: { offers: { where: { status: "PENDING" } } } },
    },
  });
}

export async function getSellerOffers(userId: string) {
  const rows = await db.offer.findMany({
    where: { listing: { sellerId: userId } },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { name: true } },
      listing: { select: { id: true, platform: true, username: true, priceEtb: true } },
    },
  });
  return rows.map(({ buyer, listing, ...offer }) => ({
    ...offer,
    buyerName: publicSellerName(buyer.name),
    listingId: listing.id,
    platform: listing.platform,
    username: listing.username,
    askingEtb: listing.priceEtb,
  }));
}

export async function getSellerOrders(userId: string) {
  const rows = await db.order.findMany({ where: { sellerId: userId }, orderBy: { createdAt: "desc" }, include: orderInclude });
  return rows.map((row) => orderView(row, true));
}

// ---- መልዕክቶች

export async function getConversations(userId: string) {
  const rows = await db.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { listing: { sellerId: userId } }] },
    orderBy: { updatedAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true } },
      listing: { select: { platform: true, username: true, special: true, sellerId: true, seller: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    platform: row.listing.platform,
    handle: row.listing.special ? row.listing.username : maskUsername(row.listing.username),
    otherName: publicSellerName(row.buyerId === userId ? row.listing.seller.name : row.buyer.name),
    lastMessage: row.messages[0]?.body ?? "",
  }));
}

export async function getConversation(id: string, userId: string) {
  const row = await db.conversation.findFirst({
    where: { id, OR: [{ buyerId: userId }, { listing: { sellerId: userId } }] },
    include: {
      buyer: { select: { name: true } },
      listing: { select: { id: true, platform: true, username: true, special: true, sellerId: true, seller: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "asc" }, take: 200, select: { id: true, senderId: true, body: true, createdAt: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    listingId: row.listing.id,
    platform: row.listing.platform,
    handle: row.listing.special ? row.listing.username : maskUsername(row.listing.username),
    otherName: publicSellerName(row.buyerId === userId ? row.listing.seller.name : row.buyer.name),
    messages: row.messages,
  };
}

// ---- አድሚን (ጥሪዎቹ ከrequireAdmin በኋላ ብቻ ይደረጋሉ)

export async function getAdminStats() {
  const [users, pendingListings, liveListings, openOrders, disputes, openReports, openContacts, released] = await Promise.all([
    db.user.count(),
    db.listing.count({ where: { status: "PENDING" } }),
    db.listing.count({ where: { status: "APPROVED" } }),
    db.order.count({ where: { status: { in: ["AWAITING_PAYMENT", "PAID", "TRANSFERRED", "CONFIRMED"] } } }),
    db.order.count({ where: { status: "DISPUTED" } }),
    db.report.count({ where: { resolved: false } }),
    db.contactMessage.count({ where: { resolved: false } }),
    db.order.aggregate({ where: { status: "RELEASED" }, _sum: { amountEtb: true }, _count: { _all: true } }),
  ]);
  return {
    users,
    pendingListings,
    liveListings,
    openOrders,
    disputes,
    openReports,
    openContacts,
    releasedCount: released._count._all,
    releasedTotal: released._sum.amountEtb ?? 0,
  };
}

export async function getPendingListings() {
  return db.listing.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { seller: { select: { name: true, email: true } } },
  });
}

export async function getAdminOrders() {
  return db.order.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      listing: { select: { platform: true, username: true } },
      buyer: { select: { name: true, email: true } },
      seller: { select: { name: true, email: true } },
    },
  });
}

export async function getAdminUsers() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      suspended: true,
      verifiedSeller: true,
      createdAt: true,
      _count: { select: { listings: true, purchases: true } },
    },
  });
}

export async function getAdminReports() {
  const [reports, contacts] = await Promise.all([
    db.report.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "asc" },
      include: { listing: { select: { id: true, platform: true, username: true } }, reporter: { select: { email: true } } },
    }),
    db.contactMessage.findMany({ where: { resolved: false }, orderBy: { createdAt: "asc" } }),
  ]);
  return { reports, contacts };
}
