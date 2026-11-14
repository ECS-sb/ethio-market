// የደንበኛ ፕሮፋይል (ስልክ፣ ኢሜይል፣ አካውንቶች) እና የገንዘብ ማውጣት ርዕስ መለያ። ምንም database አይጠቀምም።
import { normalizePhone } from "@/lib/telegram/detect";

export type ProfileAccount = { platform: string; value: string; details?: string };

export type CustomerProfile = {
  phones: string[];
  emails: string[];
  /** ደንበኛው ለድርጅቱ ሊሸጣቸው ያመጣቸው አካውንቶች/ቻናሎች */
  forSale: ProfileAccount[];
  /** ደንበኛው የላካቸው ሌሎች አካውንቶች ወይም ሊንኮች */
  accounts: ProfileAccount[];
  notes: string;
};

export const WITHDRAWAL_TAG = "withdrawal";
const MAX_ITEMS = 25;

export function emptyProfile(): CustomerProfile {
  return { phones: [], emails: [], forSale: [], accounts: [], notes: "" };
}

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const accounts = (value: unknown): ProfileAccount[] =>
  Array.isArray(value)
    ? value
        .filter((item): item is ProfileAccount => typeof item?.platform === "string" && typeof item?.value === "string")
        .map((item) => ({ platform: item.platform, value: item.value, ...(typeof item.details === "string" && item.details ? { details: item.details } : {}) }))
    : [];

/** ከdatabase የመጣውን JSON በጥንቃቄ ያነባል። */
export function readProfile(json: unknown): CustomerProfile {
  if (!json || typeof json !== "object") return emptyProfile();
  const value = json as Record<string, unknown>;
  return {
    phones: strings(value.phones),
    emails: strings(value.emails),
    forSale: accounts(value.forSale),
    accounts: accounts(value.accounts),
    notes: typeof value.notes === "string" ? value.notes : "",
  };
}

const accountKey = (account: ProfileAccount) =>
  account.value
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.|m\.)?/, "")
    .replace(/\/$/, "");

function unionStrings(first: string[], second: string[]): string[] {
  const seen = new Set(first.map((item) => item.toLowerCase()));
  const result = [...first];
  for (const item of second) {
    if (!seen.has(item.toLowerCase())) {
      seen.add(item.toLowerCase());
      result.push(item);
    }
  }
  return result.slice(0, MAX_ITEMS);
}

function unionAccounts(first: ProfileAccount[], second: ProfileAccount[]): ProfileAccount[] {
  const result = [...first];
  for (const account of second) {
    const index = result.findIndex((item) => accountKey(item) === accountKey(account));
    if (index === -1) result.push(account);
    else if (account.details && !result[index].details) result[index] = { ...result[index], details: account.details };
  }
  return result.slice(0, MAX_ITEMS);
}

/** ሁለት ፕሮፋይሎችን ያዋህዳል፤ ለሽያጭ የቀረበ አካውንት ከ"ሌሎች አካውንቶች" ውስጥ ይወጣል። */
export function mergeProfile(base: CustomerProfile, update: Partial<CustomerProfile>): CustomerProfile {
  const forSale = unionAccounts(base.forSale, update.forSale ?? []);
  const forSaleKeys = new Set(forSale.map(accountKey));
  return {
    phones: unionStrings(base.phones, update.phones ?? []),
    emails: unionStrings(base.emails, update.emails ?? []),
    forSale,
    accounts: unionAccounts(base.accounts, update.accounts ?? []).filter((account) => !forSaleKeys.has(accountKey(account))),
    notes: update.notes?.trim() ? update.notes.trim().slice(0, 500) : base.notes,
  };
}

export function sameProfile(first: CustomerProfile, second: CustomerProfile): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

const PHONE = /(?<![\d+])(?:(?:\+|00)?\s?251|0)?[\s.-]*[79](?:[\s.-]*\d){8}(?!\d)/g;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const SOCIAL: { platform: string; pattern: RegExp }[] = [
  { platform: "TikTok", pattern: /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|m\.)?tiktok\.com\/[@\w./-]{2,60}/gi },
  { platform: "YouTube", pattern: /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:@[\w.-]{2,60}|channel\/[\w-]{10,40}|c\/[\w.-]{2,60})|youtu\.be\/[\w-]{6,20})/gi },
  { platform: "Instagram", pattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[\w.]{2,40}/gi },
  { platform: "Facebook", pattern: /(?:https?:\/\/)?(?:www\.|m\.|web\.)?(?:facebook|fb)\.com\/[\w.\-/?=&]{2,80}/gi },
  { platform: "Telegram", pattern: /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/[\w+]{3,64}/gi },
  { platform: "X", pattern: /(?:https?:\/\/)?(?:www\.)?(?:x|twitter)\.com\/\w{2,30}/gi },
];
const MENTION = /(?<![\w@.\/])@([A-Za-z][A-Za-z0-9_.]{3,31})(?![\w@])/g;

/** ደንበኛው በጻፈው ጽሑፍ ውስጥ ያሉ ስልኮች፣ ኢሜይሎች እና የሶሻል ሚዲያ ሊንኮች። የይለፍ ቃል አይወሰድም። */
export function extractContactDetails(text: string, contactPhone?: string): Partial<CustomerProfile> {
  const phones = [...text.matchAll(PHONE)].map((match) => normalizePhone(match[0])).filter((phone): phone is string => Boolean(phone));
  if (contactPhone) phones.push(normalizePhone(contactPhone) ?? contactPhone.replace(/[^\d+]/g, ""));
  const emails = [...text.matchAll(EMAIL)].map((match) => match[0].toLowerCase());
  const found: ProfileAccount[] = [];
  let rest = text;
  for (const { platform, pattern } of SOCIAL) {
    for (const match of rest.matchAll(pattern)) {
      found.push({ platform, value: match[0].replace(/^(https?:\/\/)?(www\.)?/i, "").replace(/[.,)]+$/, "") });
    }
    rest = rest.replace(pattern, " ");
  }
  const emailFree = rest.replace(EMAIL, " ");
  for (const match of emailFree.matchAll(MENTION)) found.push({ platform: "Username", value: `@${match[1]}` });
  return {
    phones: [...new Set(phones.filter(Boolean))],
    emails: [...new Set(emails)],
    accounts: found,
  };
}

// ከቲክቶክ (ወይም ከሌላ መድረክ) ገንዘብ ማውጣት፣ የPayPal/ዶላር ምንዛሬ የሚጠይቁ መልዕክቶች።
const WITHDRAWAL_PATTERNS = [
  /\bwithdraw/i,
  /\bpay\s?pal\b/i,
  /\bpayoneer\b/i,
  /ፔይፓል|ፔፓል|ፔይ\s?ፓል|ፔዮኔር|ፓዮኒር/,
  /ዊዝድሮ|ዊድሮ/,
  /(ገንዘብ|ገንዘቡን|ብር|ብሩን|ዶላር|ዶላሩን|ክፍያ|ክፍያውን)\s*(ማውጣት|ማውጣ|አውጡ|አውጡልኝ|አውጣልኝ|አውጪልኝ|እንዲወጣ|ይውጣ|የማውጣት|ማስወጣት|አወጣጥ)/,
  /(ዶላር|dollars?|usd|\$)[^\n]{0,25}(መንዝር|መመንዘር|መቀየር|ቀይሩ|ቀይሩልኝ|ምንዛሬ|exchange|convert)/i,
  /(መንዝሩልኝ|መንዝሩ|ምንዛሬ|exchange|convert)[^\n]{0,25}(ዶላር|dollars?|usd)/i,
  /tik\s?tok[^\n]{0,30}(money|cash|payout|reward|earning|ገንዘብ|ብር|ክፍያ|ገቢ)/i,
  /(ቲክቶክ|ቲክ\s?ቶክ)[^\n]{0,30}(ገንዘብ|ብር|ክፍያ|ገቢ|ዶላር)/,
  /creator\s*rewards|creativity\s*program|tiktok\s*coins?|\bdiamonds?\b[^\n]{0,15}(cash|money|ብር)/i,
];

export function mentionsWithdrawal(text: string): boolean {
  return WITHDRAWAL_PATTERNS.some((pattern) => pattern.test(text));
}
