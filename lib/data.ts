// የናሙና መረጃ ብቻ ነው። ዳታቤዝ ሲገናኝ በእውነተኛ መረጃ ይተካል።

export type PlatformId =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "telegram"
  | "facebook"
  | "x";

export type ListingStatus = "available" | "in-progress" | "sold";

export type Platform = {
  id: PlatformId;
  name: string;
  mark: string;
  unit: string;
};

export type Option = { value: string; label: string };

export type Seller = {
  id: string;
  name: string;
  rating: number;
  deals: number;
  joinedYear: number;
  verified: boolean;
  country: string;
};

export type Listing = {
  id: string;
  platform: PlatformId;
  handle: string;
  followers: number;
  posts: number;
  price: number;
  category: string;
  country: string;
  femaleShare: number;
  engagement: number;
  joinedYear: number;
  sellerId: string;
  status: ListingStatus;
  special: boolean;
  originalEmail: boolean;
  growth: number[];
};

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
  { value: "500000-", label: "ከ500ሺ በላይ", min: 500000, max: Infinity },
];

export const priceRanges = [
  { value: "0-5000", label: "እስከ 5,000 ብር", min: 0, max: 5000 },
  { value: "5000-20000", label: "5,000 – 20,000 ብር", min: 5000, max: 20000 },
  { value: "20000-100000", label: "20,000 – 100,000 ብር", min: 20000, max: 100000 },
  { value: "100000-", label: "ከ100,000 ብር በላይ", min: 100000, max: Infinity },
];

export const sortOptions: Option[] = [
  { value: "recommended", label: "የሚመከሩ" },
  { value: "newest", label: "አዲስ የገቡ" },
  { value: "price-asc", label: "ዋጋ፦ ከዝቅተኛ" },
  { value: "price-desc", label: "ዋጋ፦ ከከፍተኛ" },
  { value: "followers-desc", label: "ብዙ ተከታይ ያላቸው" },
];

export const sellers: Seller[] = [
  { id: "s1", name: "ሳምፕል ሻጭ ሀ", rating: 4.9, deals: 48, joinedYear: 2022, verified: true, country: "ET" },
  { id: "s2", name: "ሳምፕል ሻጭ ለ", rating: 4.8, deals: 31, joinedYear: 2023, verified: true, country: "ET" },
  { id: "s3", name: "ሳምፕል ሻጭ ሐ", rating: 4.6, deals: 17, joinedYear: 2023, verified: true, country: "US" },
  { id: "s4", name: "ሳምፕል ሻጭ መ", rating: 4.5, deals: 9, joinedYear: 2024, verified: false, country: "ET" },
  { id: "s5", name: "ሳምፕል ሻጭ ሠ", rating: 4.2, deals: 4, joinedYear: 2025, verified: false, country: "AE" },
];

type Row = [
  id: string,
  platform: PlatformId,
  handle: string,
  followers: number,
  posts: number,
  price: number,
  category: string,
  country: string,
  femaleShare: number,
  engagement: number,
  joinedYear: number,
  sellerId: string,
  status: ListingStatus,
  special: boolean,
  originalEmail: boolean,
];

const rows: Row[] = [
  ["1001", "instagram", "***_addis", 48200, 612, 38000, "lifestyle", "ET", 62, 4.1, 2019, "s1", "available", false, true],
  ["1002", "tiktok", "***ethio", 215000, 340, 92000, "entertainment", "ET", 54, 7.8, 2021, "s2", "available", false, true],
  ["1003", "youtube", "***tech", 86400, 205, 145000, "tech", "ET", 21, 5.2, 2018, "s1", "available", false, true],
  ["1004", "telegram", "***news", 132000, 4100, 78000, "business", "ET", 38, 3.4, 2020, "s3", "available", false, false],
  ["1005", "facebook", "***shop", 310000, 1880, 120000, "business", "ET", 47, 1.9, 2016, "s2", "in-progress", false, true],
  ["1006", "x", "***dev", 12400, 2300, 14500, "tech", "US", 28, 2.6, 2017, "s3", "available", false, true],
  ["1007", "instagram", "***fit", 9200, 188, 7500, "fitness", "ET", 58, 6.3, 2022, "s4", "available", false, false],
  ["1008", "instagram", "***style", 640000, 1420, 480000, "fashion", "AE", 76, 2.8, 2017, "s5", "available", false, true],
  ["1009", "tiktok", "***food", 28700, 96, 16000, "food", "ET", 66, 8.9, 2023, "s4", "available", false, false],
  ["1010", "youtube", "***music", 520000, 412, 650000, "music", "ET", 49, 4.4, 2015, "s1", "in-progress", false, true],
  ["1011", "telegram", "***learn", 4300, 860, 3500, "education", "ET", 44, 5.7, 2023, "s4", "available", false, false],
  ["1012", "x", "abc", 1800, 240, 60000, "tech", "US", 31, 1.2, 2010, "s3", "available", true, true],
  ["1013", "instagram", "selam", 3100, 75, 95000, "lifestyle", "ET", 59, 3.3, 2014, "s1", "available", true, true],
  ["1014", "tiktok", "***travel", 74000, 158, 34000, "travel", "CA", 52, 6.1, 2022, "s3", "available", false, true],
  ["1015", "facebook", "***edu", 96000, 950, 42000, "education", "ET", 41, 2.7, 2018, "s2", "available", false, true],
  ["1016", "youtube", "***kids", 18800, 130, 26000, "entertainment", "DE", 55, 3.8, 2020, "s5", "available", false, false],
  ["1017", "instagram", "***cafe", 16500, 402, 12000, "food", "ET", 61, 5.1, 2020, "s2", "sold", false, true],
  ["1018", "tiktok", "***dance", 402000, 280, 210000, "entertainment", "SA", 68, 9.4, 2021, "s5", "sold", false, true],
  ["1019", "telegram", "***jobs", 58000, 3200, 46000, "business", "ET", 43, 4.2, 2019, "s1", "sold", false, false],
  ["1020", "youtube", "***cook", 33200, 174, 55000, "food", "ET", 72, 4.9, 2019, "s2", "sold", false, true],
];

function growthFor(followers: number, seed: number): number[] {
  const steps = [0.71, 0.74, 0.79, 0.78, 0.84, 0.88, 0.87, 0.93, 1];
  return steps.map((step, index) => {
    const wobble = ((seed * (index + 3)) % 7) / 200;
    return Math.round(followers * Math.min(1, step + (index === 8 ? 0 : wobble)));
  });
}

export const listings: Listing[] = rows.map((row, index) => {
  const [
    id,
    platform,
    handle,
    followers,
    posts,
    price,
    category,
    country,
    femaleShare,
    engagement,
    joinedYear,
    sellerId,
    status,
    special,
    originalEmail,
  ] = row;
  return {
    id,
    platform,
    handle,
    followers,
    posts,
    price,
    category,
    country,
    femaleShare,
    engagement,
    joinedYear,
    sellerId,
    status,
    special,
    originalEmail,
    growth: growthFor(followers, index + 2),
  };
});

export const growthLabels = ["መስ", "ጥቅ", "ኅዳ", "ታኅ", "ጥር", "የካ", "መጋ", "ሚያ", "ግን"];

export const statusLabels: Record<ListingStatus, string> = {
  available: "ለሽያጭ ክፍት",
  "in-progress": "በሂደት ላይ",
  sold: "ተሽጧል",
};

export const faqs = [
  {
    question: "Escrow ምንድን ነው?",
    answer:
      "ገዢው የሚከፍለው ገንዘብ አካውንቱ በትክክል እስኪተላለፍ ድረስ በመካከለኛ ቦታ የሚቆይበት አሰራር ነው። ገዢው ርክክቡን ካረጋገጠ በኋላ ገንዘቡ ለሻጩ ይለቀቃል።",
  },
  {
    question: "ሻጩ የአካውንቱ ባለቤት መሆኑ እንዴት ይረጋገጣል?",
    answer:
      "ሻጩ የሚሰጠውን የማረጋገጫ ኮድ በአካውንቱ መግለጫ (bio) ላይ ያስቀምጣል። ኮዱ ከታየ በኋላ ማስታወቂያው ለግምገማ ይላካል።",
  },
  {
    question: "ዋጋ መደራደር እችላለሁ?",
    answer:
      "አዎ። በማስታወቂያው ገጽ ላይ የራስዎን ቅናሽ ማቅረብ ይችላሉ። ሻጩ ቅናሹን መቀበል ወይም አለመቀበል ይችላል።",
  },
  {
    question: "ከመግዛቴ በፊት ምን ማረጋገጥ አለብኝ?",
    answer:
      "የተከታዮችን ዕድገት፣ የተሳትፎ መጠን፣ የአድማጮችን ሀገር እና የአካውንቱን ዕድሜ ይመልከቱ። እንዲሁም የመድረኩ ደንብ የአካውንት ሽያጭን መፍቀዱን ያረጋግጡ።",
  },
  {
    question: "ርክክቡ ችግር ቢያጋጥመው ምን ይሆናል?",
    answer:
      "ገዢው ርክክቡን እስካላረጋገጠ ድረስ ክፍያው ለሻጩ አይለቀቅም። ችግሩ በሁለቱ ወገኖች ካልተፈታ የድጋፍ ቡድኑ ጉዳዩን ይመለከታል።",
  },
  {
    question: "ማስታወቂያ ለመለጠፍ ምን ያስፈልገኛል?",
    answer:
      "የተመዘገበ መለያ፣ የሚሸጠው አካውንት ባለቤትነት፣ ትክክለኛ የአካውንት መረጃ እና የሚፈልጉት ዋጋ ያስፈልጋሉ።",
  },
];

export const howItWorksSteps = [
  { title: "ባለቤትነት ይረጋገጣል", description: "ሻጩ አካውንቱን ያስገባል፣ የማረጋገጫ ኮዱንም በአካውንቱ መግለጫ ላይ ያስቀምጣል።" },
  { title: "ገዢው ቅናሽ ያቀርባል", description: "ገዢው መረጃውን ገምግሞ ያወዳድራል፣ ከዚያም ቅናሽ ይልካል ወይም ዋጋውን ይቀበላል።" },
  { title: "ክፍያው በEscrow ይቆያል", description: "ቅናሹ ከተቀበለ በኋላ ገዢው ይከፍላል፤ ርክክቡ እስኪያልቅ ገንዘቡ ለሻጩ አይለቀቅም።" },
  { title: "ርክክብ እና ክፍያ", description: "የአካውንቱ መግቢያ ይተላለፋል፣ ገዢው ያረጋግጣል፣ ገንዘቡም ለሻጩ ይለቀቃል።" },
];

export const escrowStages = ["ቅናሽ ተቀበለ", "ክፍያ ተፈጸመ", "አካውንት ተላለፈ", "ገዢ አረጋገጠ", "ተጠናቀቀ"];

export const myListings = [
  { listingId: "1001", views: 1240, offers: 3 },
  { listingId: "1003", views: 860, offers: 1 },
  { listingId: "1010", views: 3120, offers: 5 },
  { listingId: "1017", views: 540, offers: 2 },
];

export const myOffers = [
  { id: "o1", listingId: "1001", buyer: "ሳምፕል ገዢ 1", amount: 34000, age: "ከ2 ሰዓት በፊት" },
  { id: "o2", listingId: "1001", buyer: "ሳምፕል ገዢ 2", amount: 36500, age: "ትናንት" },
  { id: "o3", listingId: "1003", buyer: "ሳምፕል ገዢ 3", amount: 130000, age: "ከ3 ቀናት በፊት" },
];

export const myOrders = [
  { id: "EM-2041", listingId: "1002", role: "ገዢ", stage: 2, amount: 92000 },
  { id: "EM-2038", listingId: "1010", role: "ሻጭ", stage: 1, amount: 650000 },
  { id: "EM-2017", listingId: "1017", role: "ሻጭ", stage: 4, amount: 12000 },
];

export const conversations = [
  {
    id: "c1",
    name: "ሳምፕል ገዢ 1",
    listingId: "1001",
    messages: [
      { from: "them", text: "ሰላም፣ አካውንቱ ላይ ያሉት ተከታዮች በአብዛኛው ከየት ናቸው?" },
      { from: "me", text: "ሰላም። አብዛኞቹ ከኢትዮጵያ ናቸው፤ ዝርዝሩን በማስታወቂያው ላይ ማየት ይችላሉ።" },
      { from: "them", text: "አመሰግናለሁ። ቅናሽ እልካለሁ።" },
    ],
  },
  {
    id: "c2",
    name: "ሳምፕል ሻጭ ለ",
    listingId: "1002",
    messages: [
      { from: "me", text: "ክፍያውን ፈጽሜያለሁ። ርክክቡን መቼ መጀመር እንችላለን?" },
      { from: "them", text: "ዛሬ ማታ መጀመር እንችላለን።" },
    ],
  },
];

export function getPlatform(id: string): Platform | undefined {
  return platforms.find((platform) => platform.id === id);
}

export function getListing(id: string): Listing | undefined {
  return listings.find((listing) => listing.id === id);
}

export function getSeller(id: string): Seller | undefined {
  return sellers.find((seller) => seller.id === id);
}

export function labelOf(options: Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export const activeListings = listings.filter((listing) => listing.status !== "sold");

export function countByPlatform(id: PlatformId): number {
  return activeListings.filter((listing) => listing.platform === id).length;
}

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("en-US").format(value)} ብር`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
