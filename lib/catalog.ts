import type { MessageKey } from "@/lib/messages";

export type PlatformId = "instagram" | "tiktok" | "youtube" | "telegram" | "facebook" | "x";
export type ListingStatusValue = "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "SOLD" | "ARCHIVED";
export type OfferStatusValue = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type OrderStatusValue =
  | "AWAITING_PAYMENT"
  | "PAID"
  | "TRANSFERRED"
  | "CONFIRMED"
  | "RELEASED"
  | "DISPUTED"
  | "CANCELLED";

export type Option = { value: string; label: MessageKey };

export type Platform = { id: PlatformId; name: string; mark: string; unit: MessageKey };

export const platforms: Platform[] = [
  { id: "instagram", name: "Instagram", mark: "IG", unit: "Followers" },
  { id: "tiktok", name: "TikTok", mark: "TT", unit: "Followers" },
  { id: "youtube", name: "YouTube", mark: "YT", unit: "Subscribers" },
  { id: "telegram", name: "Telegram", mark: "TG", unit: "Members" },
  { id: "facebook", name: "Facebook", mark: "FB", unit: "Followers" },
  { id: "x", name: "X", mark: "X", unit: "Followers" },
];

export const MAX_SCREENSHOTS = 4;
// Vercel ጥያቄን እስከ 4.5MB ብቻ ይቀበላል፤ 4 ምስል × 1MB ከዚህ በታች ይቀራል።
export const MAX_SCREENSHOT_BYTES = 1_000_000;

export const contact = {
  telegramChannel: "@ethiocss",
  telegramChannelUrl: "https://t.me/ethiocss",
  telegramUser: "@ethiocomputerschool",
  telegramUserUrl: "https://t.me/ethiocomputerschool",
  phone: "0924888899",
  phoneUrl: "tel:+251924888899",
};

export const categories: Option[] = [
  { value: "lifestyle", label: "Lifestyle" },
  { value: "business", label: "Business" },
  { value: "tech", label: "Technology" },
  { value: "education", label: "Education" },
  { value: "fashion", label: "Fashion" },
  { value: "food", label: "Food" },
  { value: "fitness", label: "Sports & health" },
  { value: "music", label: "Music" },
  { value: "entertainment", label: "Entertainment" },
  { value: "travel", label: "Travel" },
];

export const countries: Option[] = [
  { value: "ET", label: "Ethiopia" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "DE", label: "Germany" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "AE", label: "UAE (Dubai)" },
];

export const followerRanges: (Option & { min: number; max: number | null })[] = [
  { value: "0-5000", label: "Up to 5K", min: 0, max: 5000 },
  { value: "5000-20000", label: "5K – 20K", min: 5000, max: 20000 },
  { value: "20000-100000", label: "20K – 100K", min: 20000, max: 100000 },
  { value: "100000-500000", label: "100K – 500K", min: 100000, max: 500000 },
  { value: "500000-", label: "Over 500K", min: 500000, max: null },
];

export const priceRanges: (Option & { min: number; max: number | null })[] = [
  { value: "0-5000", label: "Up to 5,000 ETB", min: 0, max: 5000 },
  { value: "5000-20000", label: "5,000 – 20,000 ETB", min: 5000, max: 20000 },
  { value: "20000-100000", label: "20,000 – 100,000 ETB", min: 20000, max: 100000 },
  { value: "100000-", label: "Over 100,000 ETB", min: 100000, max: null },
];

export const sortOptions: Option[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "followers-desc", label: "Most followers" },
];

export const reportReasons: Option[] = [
  { value: "fake", label: "False information" },
  { value: "ownership", label: "Ownership concern" },
  { value: "other", label: "Other" },
];

export const listingStatusLabels: Record<ListingStatusValue, MessageKey> = {
  PENDING: "In review",
  APPROVED: "For sale",
  REJECTED: "Rejected",
  IN_PROGRESS: "In progress",
  SOLD: "Sold",
  ARCHIVED: "Removed",
};

export const offerStatusLabels: Record<OfferStatusValue, MessageKey> = {
  PENDING: "Awaiting reply",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const orderStatusLabels: Record<OrderStatusValue, MessageKey> = {
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Payment confirmed",
  TRANSFERRED: "Account transferred",
  CONFIRMED: "Buyer confirmed",
  RELEASED: "Completed",
  DISPUTED: "In dispute",
  CANCELLED: "Cancelled",
};

export const orderStages: OrderStatusValue[] = ["AWAITING_PAYMENT", "PAID", "TRANSFERRED", "CONFIRMED", "RELEASED"];

export const howItWorksSteps: { title: MessageKey; description: MessageKey }[] = [
  { title: "Ownership is verified", description: "The seller adds the account, puts the verification code in its bio, and an admin reviews it." },
  { title: "The buyer makes an offer", description: "The buyer reviews and compares the details, then sends the seller an offer." },
  { title: "Payment is confirmed", description: "When the seller accepts, an order opens and an admin confirms the payment." },
  { title: "Handover and completion", description: "The seller transfers the account, the buyer confirms, and the order is completed for the seller." },
];

export const faqs: { question: MessageKey; answer: MessageKey }[] = [
  {
    question: "How is the seller's ownership verified?",
    answer: "Each new listing gets a verification code. The seller puts it in the account's bio, and an admin checks the code before approving the listing.",
  },
  {
    question: "Can I negotiate the price?",
    answer: "Yes. You can make an offer on the listing page or message the seller. The seller can accept or decline your offer.",
  },
  {
    question: "How does payment work?",
    answer: "Online payment is not connected yet. Don't send money to anyone without instructions from an admin.",
  },
  {
    question: "Are account passwords stored here?",
    answer: "No, and they should never be sent in messages. The handover happens between the buyer and seller after payment is confirmed.",
  },
  {
    question: "What if something goes wrong with the handover?",
    answer: "You can open a dispute from your dashboard. Orders in dispute are reviewed by an admin.",
  },
  {
    question: "What should I check before buying?",
    answer: "Review the account's age, engagement and audience; these details come from the seller. Also check that the platform's rules allow selling accounts.",
  },
];

/** የመነሻ ገጽ ማሳያ ምስል ብቻ፤ እውነተኛ አካውንትን አይወክልም። */
export const illustrationAccounts: { mark: string; handle: string; followers: number; unit: MessageKey; priceEtb: number }[] = [
  { mark: "TT", handle: "***ethio", followers: 215000, unit: "Followers", priceEtb: 92000 },
  { mark: "YT", handle: "***tech", followers: 86400, unit: "Subscribers", priceEtb: 145000 },
];

export const illustrationGrowth = [61000, 74000, 86000, 92000, 118000, 139000, 151000, 188000, 215000];

export const growthLabels: MessageKey[] = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

export function getPlatform(id: string): Platform | undefined {
  return platforms.find((platform) => platform.id === id);
}

export function labelOf(options: Option[], value: string): MessageKey {
  const found = options.find((option) => option.value === value);
  return found ? found.label : "Other";
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPrice(t: (key: MessageKey, vars?: Record<string, string | number>) => string, value: number): string {
  return t("{amount} ETB", { amount: formatNumber(value) });
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Africa/Addis_Ababa" }).format(new Date(value));
}
