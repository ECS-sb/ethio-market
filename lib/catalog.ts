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

export type Option = { value: string; label: string };

export type Platform = { id: PlatformId; name: string; mark: string; unit: string };

export const platforms: Platform[] = [
  { id: "instagram", name: "Instagram", mark: "IG", unit: "ተከታዮች" },
  { id: "tiktok", name: "TikTok", mark: "TT", unit: "ተከታዮች" },
  { id: "youtube", name: "YouTube", mark: "YT", unit: "ሰብስክራይበሮች" },
  { id: "telegram", name: "Telegram", mark: "TG", unit: "አባላት" },
  { id: "facebook", name: "Facebook", mark: "FB", unit: "ተከታዮች" },
  { id: "x", name: "X", mark: "X", unit: "ተከታዮች" },
];

export const categories: Option[] = [
  { value: "lifestyle", label: "የአኗኗር ዘይቤ" },
  { value: "business", label: "ንግድ" },
  { value: "tech", label: "ቴክኖሎጂ" },
  { value: "education", label: "ትምህርት" },
  { value: "fashion", label: "ፋሽን" },
  { value: "food", label: "ምግብ" },
  { value: "fitness", label: "ስፖርት እና ጤና" },
  { value: "music", label: "ሙዚቃ" },
  { value: "entertainment", label: "መዝናኛ" },
  { value: "travel", label: "ጉዞ" },
];

export const countries: Option[] = [
  { value: "ET", label: "ኢትዮጵያ" },
  { value: "US", label: "አሜሪካ" },
  { value: "CA", label: "ካናዳ" },
  { value: "DE", label: "ጀርመን" },
  { value: "SA", label: "ሳውዲ አረቢያ" },
  { value: "AE", label: "ዱባይ (ኤምሬትስ)" },
];

export const followerRanges = [
  { value: "0-5000", label: "እስከ 5ሺ", min: 0, max: 5000 },
  { value: "5000-20000", label: "5ሺ – 20ሺ", min: 5000, max: 20000 },
  { value: "20000-100000", label: "20ሺ – 100ሺ", min: 20000, max: 100000 },
  { value: "100000-500000", label: "100ሺ – 500ሺ", min: 100000, max: 500000 },
  { value: "500000-", label: "ከ500ሺ በላይ", min: 500000, max: null },
];

export const priceRanges = [
  { value: "0-5000", label: "እስከ 5,000 ብር", min: 0, max: 5000 },
  { value: "5000-20000", label: "5,000 – 20,000 ብር", min: 5000, max: 20000 },
  { value: "20000-100000", label: "20,000 – 100,000 ብር", min: 20000, max: 100000 },
  { value: "100000-", label: "ከ100,000 ብር በላይ", min: 100000, max: null },
];

export const sortOptions: Option[] = [
  { value: "newest", label: "አዲስ የገቡ" },
  { value: "price-asc", label: "ዋጋ፦ ከዝቅተኛ" },
  { value: "price-desc", label: "ዋጋ፦ ከከፍተኛ" },
  { value: "followers-desc", label: "ብዙ ተከታይ ያላቸው" },
];

export const reportReasons: Option[] = [
  { value: "fake", label: "የሐሰት መረጃ" },
  { value: "ownership", label: "የባለቤትነት ጥርጣሬ" },
  { value: "other", label: "ሌላ" },
];

export const listingStatusLabels: Record<ListingStatusValue, string> = {
  PENDING: "ግምገማ ላይ",
  APPROVED: "ለሽያጭ ክፍት",
  REJECTED: "ውድቅ ተደርጓል",
  IN_PROGRESS: "በሂደት ላይ",
  SOLD: "ተሽጧል",
  ARCHIVED: "ተወግዷል",
};

export const offerStatusLabels: Record<OfferStatusValue, string> = {
  PENDING: "መልስ በመጠበቅ ላይ",
  ACCEPTED: "ተቀባይነት አግኝቷል",
  REJECTED: "ውድቅ ተደርጓል",
  WITHDRAWN: "ተሰርዟል",
};

export const orderStatusLabels: Record<OrderStatusValue, string> = {
  AWAITING_PAYMENT: "ክፍያ በመጠበቅ ላይ",
  PAID: "ክፍያ ተረጋግጧል",
  TRANSFERRED: "አካውንት ተላልፏል",
  CONFIRMED: "ገዢ አረጋግጧል",
  RELEASED: "ተጠናቋል",
  DISPUTED: "ክርክር ላይ",
  CANCELLED: "ተሰርዟል",
};

export const orderStages: OrderStatusValue[] = ["AWAITING_PAYMENT", "PAID", "TRANSFERRED", "CONFIRMED", "RELEASED"];

export const howItWorksSteps = [
  { title: "ባለቤትነት ይረጋገጣል", description: "ሻጩ አካውንቱን ያስገባል፣ የማረጋገጫ ኮዱን በአካውንቱ መግለጫ ላይ ያስቀምጣል፣ አስተዳዳሪውም ይገመግማል።" },
  { title: "ገዢው ቅናሽ ያቀርባል", description: "ገዢው መረጃውን ገምግሞ ያወዳድራል፣ ከዚያም ለሻጩ ቅናሽ ይልካል።" },
  { title: "ክፍያው ይረጋገጣል", description: "ሻጩ ቅናሹን ሲቀበል ትዕዛዝ ይከፈታል፤ ክፍያው በአስተዳዳሪው ይረጋገጣል።" },
  { title: "ርክክብ እና ክፍያ", description: "ሻጩ አካውንቱን ያስተላልፋል፣ ገዢው ያረጋግጣል፣ ከዚያም ክፍያው ለሻጩ ይለቀቃል።" },
];

export const faqs = [
  {
    question: "ሻጩ የአካውንቱ ባለቤት መሆኑ እንዴት ይረጋገጣል?",
    answer: "ማስታወቂያ ሲፈጠር የማረጋገጫ ኮድ ይሰጣል። ሻጩ ኮዱን በአካውንቱ መግለጫ (bio) ላይ ያስቀምጣል፣ አስተዳዳሪው ኮዱን አይቶ ማስታወቂያውን ያጸድቃል።",
  },
  {
    question: "ዋጋ መደራደር እችላለሁ?",
    answer: "አዎ። በማስታወቂያው ገጽ ላይ ቅናሽ ማቅረብ ወይም ሻጩን በመልዕክት ማነጋገር ይችላሉ። ሻጩ ቅናሹን መቀበል ወይም አለመቀበል ይችላል።",
  },
  {
    question: "ክፍያ እንዴት ነው የሚፈጸመው?",
    answer: "የመስመር ላይ ክፍያ ገና አልተገናኘም። ከአስተዳዳሪው መመሪያ ሳያገኙ ለማንም ገንዘብ አይላኩ።",
  },
  {
    question: "የአካውንት የይለፍ ቃል እዚህ ላይ ይቀመጣል?",
    answer: "አይቀመጥም፣ በመልዕክትም መላክ የለበትም። ርክክቡ በገዢው እና በሻጩ መካከል፣ ክፍያው ከተረጋገጠ በኋላ ይደረጋል።",
  },
  {
    question: "ርክክቡ ችግር ቢያጋጥመው ምን ይሆናል?",
    answer: "ከዳሽቦርድዎ ክርክር መክፈት ይችላሉ። ክርክር ላይ ያለ ትዕዛዝ በአስተዳዳሪው ይታያል።",
  },
  {
    question: "ከመግዛቴ በፊት ምን ማረጋገጥ አለብኝ?",
    answer: "የአካውንቱን ዕድሜ፣ ተሳትፎ እና አድማጮች ይገምግሙ፤ መረጃው በሻጩ የቀረበ ነው። እንዲሁም የመድረኩ ደንብ የአካውንት ሽያጭን መፍቀዱን ያረጋግጡ።",
  },
];

/** የመነሻ ገጽ ማሳያ ምስል ብቻ፤ እውነተኛ አካውንትን አይወክልም። */
export const illustrationAccounts = [
  { mark: "TT", handle: "***ethio", followers: 215000, unit: "ተከታዮች", priceEtb: 92000 },
  { mark: "YT", handle: "***tech", followers: 86400, unit: "ሰብስክራይበሮች", priceEtb: 145000 },
];

export const illustrationGrowth = [61000, 74000, 86000, 92000, 118000, 139000, 151000, 188000, 215000];

export const growthLabels = ["መስ", "ጥቅ", "ኅዳ", "ታኅ", "ጥር", "የካ", "መጋ", "ሚያ", "ግን"];

export function getPlatform(id: string): Platform | undefined {
  return platforms.find((platform) => platform.id === id);
}

export function labelOf(options: Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("en-US").format(value)} ብር`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Africa/Addis_Ababa" }).format(new Date(value));
}
