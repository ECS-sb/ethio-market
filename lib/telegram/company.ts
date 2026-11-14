// የድርጅቱ የክፍያ ሂሳቦች እና ስሞች፤ ደረሰኙ ወደ ድርጅቱ መከፈሉን ለመወሰን። ምንም database ወይም network አይጠቀምም።
import { normalizePhone, parseAllowlist, type Allowlist } from "@/lib/telegram/detect";

export type CompanyProfile = { allow: Allowlist; names: string[] };

export const DEFAULT_COMPANY_NAMES = "Ethio CS, Ethio Computer School, ECS";

export function loadCompanyProfile(env: { contacts?: string; names?: string } = {}): CompanyProfile {
  return {
    allow: parseAllowlist(env.contacts ?? process.env.TELEGRAM_ALLOWED_CONTACTS),
    names: (env.names ?? process.env.TELEGRAM_COMPANY_NAMES ?? DEFAULT_COMPANY_NAMES)
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
  };
}

/** የተሸፈኑ አሃዞች (*, x, •, #) ከቁጥሮች ጋር ተጣብቀው ሲመጡ ብቻ እንደ ሽፋን ይቆጠራሉ፤ በቃላት ውስጥ ያለ x አይቆጠርም። */
const MASKED_NUMBER = /\d*[*xX•#]+\d+|\d+[*xX•#]+/;
const MASK_RUN = /[*xX•#]+/g;

/**
 * ደረሰኙ ላይ የታተመው የተቀባይ ሂሳብ የድርጅቱ ነው? true / false፣ ወይም ለመወሰን በቂ መረጃ ከሌለ null።
 * ሶስት አይነት አጻጻፍ ይረዳል፦ ሙሉ ቁጥር (1000543473735)፣ የተሸፈነ (1000****3735)፣
 * እና ከጽሑፍ ጋር የተቀላቀለ (CBE አንዳንዴ "CS-ETB-3735" ብሎ የመጨረሻ አሃዞችን ብቻ ያሳያል)።
 */
export function accountMatches(raw: string, allow: Allowlist): boolean | null {
  const compact = raw.replace(/[\s.\-()]/g, "");
  const visibleDigits = compact.replace(/\D/g, "");
  if (visibleDigits.length < 4) return null;
  const candidates = [...allow.numbers, ...allow.phones, ...[...allow.phones].map((phone) => `251${phone.slice(1)}`)];

  if (/^\+?\d+$/.test(compact)) {
    const phone = normalizePhone(visibleDigits);
    if (phone) return allow.phones.has(phone);
    return candidates.includes(visibleDigits);
  }

  const masked = compact.match(MASKED_NUMBER)?.[0];
  if (masked && masked.replace(/\D/g, "").length >= 4) {
    const pattern = new RegExp(`^${masked.replace(MASK_RUN, "\\d+")}$`);
    return candidates.some((candidate) => pattern.test(candidate));
  }

  // ከጽሑፍ ጋር የተቀላቀለ፦ የመጨረሻው የቁጥር ክፍል ከድርጅቱ ሂሳብ መጨረሻ ጋር ይነጻጸራል።
  const lastGroup = compact.match(/\d+/g)?.at(-1) ?? "";
  if (lastGroup.length >= 4 && candidates.some((candidate) => candidate.endsWith(lastGroup))) return true;
  // ጥቂት አሃዞች ብቻ ከታዩ "ሌላ ሂሳብ ነው" ለማለት በቂ አይደለም፤ ውሳኔው ለስሙ ይተዋል።
  return visibleDigits.length >= 8 ? false : null;
}

/** የተቀባዩ ስም ከድርጅቱ ስሞች ጋር ይመሳሰላል? አጫጭር ስሞች (እንደ ECS) እንደ ሙሉ ቃል ብቻ ይቆጠራሉ። */
export function nameMatches(raw: string, names: string[]): boolean {
  const lower = raw.toLowerCase();
  const squashed = lower.replace(/[^a-z0-9ሀ-፿]/g, "");
  const words = new Set(lower.split(/[^a-z0-9ሀ-፿]+/).filter(Boolean));
  return names.some((name) => {
    const target = name.toLowerCase().replace(/[^a-z0-9ሀ-፿]/g, "");
    if (!target) return false;
    return target.length < 4 ? words.has(target) : squashed.includes(target);
  });
}

export type ReceiptReading = {
  is_payment_receipt: boolean;
  recipient_name: string | null;
  recipient_account: string | null;
  recipient_matches_company: "yes" | "no" | "unclear";
};

/** ቁጥሩ ከተነበበ ቁጥሩ ይወስናል፤ ካልሆነ ስሙ፣ በመጨረሻ የClaude ግምት። */
export function decideToCompany(reading: ReceiptReading, company: CompanyProfile): boolean | null {
  if (!reading.is_payment_receipt) return null;
  if (reading.recipient_account) {
    const byAccount = accountMatches(reading.recipient_account, company.allow);
    if (byAccount !== null) return byAccount;
  }
  if (reading.recipient_name && nameMatches(reading.recipient_name, company.names)) return true;
  if (reading.recipient_matches_company === "yes") return true;
  if (reading.recipient_matches_company === "no") return false;
  return null;
}

/** ለClaude የሚሰጥ የድርጅቱ መግለጫ (ሂሳቦቹ ከenv ስለሚመጡ በጥሪዎች መካከል አይቀየርም፤ ለprompt caching ይረዳል)። */
export function describeCompany(company: CompanyProfile): string {
  const lines = [
    `Company names: ${company.names.join(", ")}`,
    `Company phone numbers (also used for Telebirr): ${[...company.allow.phones].sort().join(", ") || "none listed"}`,
    `Company bank accounts, merchant and operator IDs: ${[...company.allow.numbers].sort().join(", ") || "none listed"}`,
    `Company Telegram accounts: ${[...company.allow.usernames].sort().map((name) => `@${name}`).join(", ") || "none listed"}`,
  ];
  return lines.join("\n");
}
