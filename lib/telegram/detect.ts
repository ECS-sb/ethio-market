// ሰራተኛ ለደንበኛ የላከውን መልዕክት በመመርመር ሽያጩን ወደ ግል የመውሰድ ምልክቶችን ይለያል።
// ምንም database ወይም network አይጠቀምም፤ ስለዚህ ብቻውን መሞከር ይቻላል።

export type AlertType =
  | "PHONE_NUMBER"
  | "TELEGRAM_CONTACT"
  | "WHATSAPP"
  | "BANK_ACCOUNT"
  | "SUSPICIOUS_PHRASE"
  | "DELETED_MESSAGE"
  | "PAYMENT_TO_OTHER_ACCOUNT"
  | "DUPLICATE_RECEIPT"
  | "AI_SUSPICION";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH";
export type Finding = { type: AlertType; severity: AlertSeverity; evidence: string };

/** የድርጅቱ የራሱ ስልኮች፣ የቴሌግራም ስሞች እና የባንክ ሂሳቦች፤ እነዚህ ሲላኩ ማስጠንቀቂያ አይነሳም። */
export type Allowlist = { phones: Set<string>; usernames: Set<string>; numbers: Set<string> };

/** የኢትዮጵያ ሞባይል ቁጥርን ወደ 09XXXXXXXX ወይም 07XXXXXXXX ይቀይራል፤ ቁጥር ካልሆነ null ይመልሳል። */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00251")) digits = digits.slice(2);
  if (digits.startsWith("251") && digits.length === 12) digits = `0${digits.slice(3)}`;
  if (digits.length === 9 && /^[79]/.test(digits)) digits = `0${digits}`;
  return /^0[79]\d{8}$/.test(digits) ? digits : null;
}

function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^(?:https?:\/\/)?(?:t\.me|telegram\.me|telegram\.dog)\//i, "")
    .replace(/^@/, "")
    .toLowerCase();
}

export function emptyAllowlist(): Allowlist {
  return { phones: new Set(), usernames: new Set(), numbers: new Set() };
}

/** "0911223344, @EthioComputerSchool, 1000123456789" የመሰለ ዝርዝርን ያነባል። */
export function parseAllowlist(value: string | undefined, into: Allowlist = emptyAllowlist()): Allowlist {
  for (const item of (value ?? "").split(/[,\n;]+/).map((part) => part.trim()).filter(Boolean)) {
    const phone = normalizePhone(item);
    if (phone) into.phones.add(phone);
    else if (/^(?:@|(?:https?:\/\/)?(?:t\.me|telegram\.me)\/|[A-Za-z])/.test(item)) into.usernames.add(normalizeUsername(item));
    else {
      const digits = item.replace(/\D/g, "");
      if (digits.length >= 6) into.numbers.add(digits);
    }
  }
  return into;
}

// ስልክ፦ +251 9.. / 251 9.. / 09.. / 07.. / 9.. (ክፍተት፣ ነጥብ ወይም ሰረዝ በመሃል ሊኖር ይችላል)
const PHONE = /(?<![\d+])(?:(?:\+|00)?\s?251|0)?[\s.-]*[79](?:[\s.-]*\d){8}(?!\d)/g;
// የባንክ ሂሳብ፦ ያልተቆራረጠ 10–16 አሃዝ፣ ወይም በክፍተት/ሰረዝ የተከፋፈለ 12–16 አሃዝ
const CONTIGUOUS_NUMBER = /(?<!\d)\d{10,16}(?!\d)/g;
const GROUPED_NUMBER = /(?<!\d)\d{2,8}(?:[\s-]\d{1,8}){1,5}(?!\d)/g;
const USERNAME = /(?<![\w@.\/])@([A-Za-z][A-Za-z0-9_]{3,31})(?!\w)/g;
const TELEGRAM_LINK = /(?:https?:\/\/)?(?:t\.me|telegram\.me|telegram\.dog)\/((?:\+|joinchat\/)?[A-Za-z0-9_+-]{3,64})/gi;
const WHATSAPP_LINK = /(?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com|(?:www\.)?whatsapp\.com)\/[^\s]*/gi;

// አማርኛ ፊደል የቃላት ድንበር (\b) ስለሌለው በውስጡ መኖሩ ብቻ ይፈተሻል።
const AMHARIC_PHRASES = ["በግል", "በግሌ", "ቁጥሬ", "ስልኬ", "ደውልልኝ", "ደውይልኝ", "ደውሉልኝ", "ዋትስአፕ", "ዋትሳፕ", "ኢሞ ላይ", "ቀጥታ አናግረኝ", "ቀጥታ አውራኝ"];
const LATIN_PHRASES = ["whatsapp", "imo", "inbox me", "dm me", "call me", "my number", "my phone", "privately", "personal account"];

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const LATIN_PHRASE = new RegExp(`\\b(${LATIN_PHRASES.map(escapeRegex).join("|")})\\b`, "gi");

/**
 * ከሰራተኛ የተላከ መልዕክት ውስጥ የግል አድራሻ ወይም የክፍያ መረጃ ካለ ይመልሳል።
 * contactPhone ሰራተኛው የኮንታክት ካርድ ሲያጋራ ነው።
 */
export function detectSideDeal(text: string, allow: Allowlist, extra: { contactPhone?: string } = {}): Finding[] {
  const findings = new Map<string, Finding>();
  const add = (finding: Finding) => findings.set(`${finding.type}:${finding.evidence}`, finding);

  // መጀመሪያ ረጃጅም ቁጥሮች፤ በውስጣቸው ያለ የ9 አሃዝ ክፍል እንደ ስልክ እንዳይቆጠር ቦታቸው ይያዛል።
  const accountSpans: [number, number][] = [];
  const numberCandidates = [
    ...[...text.matchAll(CONTIGUOUS_NUMBER)].map((match) => ({ match, digits: match[0] })),
    ...[...text.matchAll(GROUPED_NUMBER)]
      .map((match) => ({ match, digits: match[0].replace(/\D/g, "") }))
      .filter(({ digits }) => digits.length >= 12 && digits.length <= 16),
  ];
  for (const { match, digits } of numberCandidates) {
    if (normalizePhone(digits)) continue;
    accountSpans.push([match.index, match.index + match[0].length]);
    if (!allow.numbers.has(digits)) add({ type: "BANK_ACCOUNT", severity: "HIGH", evidence: digits });
  }

  for (const match of text.matchAll(PHONE)) {
    if (accountSpans.some(([start, end]) => match.index >= start && match.index < end)) continue;
    const phone = normalizePhone(match[0]);
    if (phone && !allow.phones.has(phone)) add({ type: "PHONE_NUMBER", severity: "HIGH", evidence: phone });
  }

  if (extra.contactPhone) {
    const phone = normalizePhone(extra.contactPhone) ?? extra.contactPhone.replace(/[^\d+]/g, "");
    if (phone && !allow.phones.has(phone)) add({ type: "PHONE_NUMBER", severity: "HIGH", evidence: phone });
  }

  for (const match of text.matchAll(WHATSAPP_LINK)) {
    add({ type: "WHATSAPP", severity: "HIGH", evidence: match[0] });
  }

  for (const match of text.matchAll(TELEGRAM_LINK)) {
    const target = match[1];
    const isInvite = target.startsWith("+") || target.toLowerCase().startsWith("joinchat/");
    if (!isInvite && allow.usernames.has(target.toLowerCase())) continue;
    add({ type: "TELEGRAM_CONTACT", severity: "MEDIUM", evidence: `t.me/${target}` });
  }

  for (const match of text.matchAll(USERNAME)) {
    const username = match[1].toLowerCase();
    if (allow.usernames.has(username)) continue;
    add({ type: "TELEGRAM_CONTACT", severity: "MEDIUM", evidence: `@${match[1]}` });
  }

  for (const phrase of AMHARIC_PHRASES) {
    if (text.includes(phrase)) add({ type: "SUSPICIOUS_PHRASE", severity: "MEDIUM", evidence: phrase });
  }
  for (const match of text.matchAll(LATIN_PHRASE)) {
    add({ type: "SUSPICIOUS_PHRASE", severity: "MEDIUM", evidence: match[1].toLowerCase() });
  }

  return [...findings.values()];
}

/** ከTELEGRAM_CONTACT ማስረጃ ውስጥ የቴሌግራም ስሙን ያወጣል (የግብዣ ሊንክ ከሆነ null)። */
export function usernameFromEvidence(evidence: string): string | null {
  if (evidence.startsWith("@")) return evidence.slice(1).toLowerCase();
  const target = evidence.replace(/^t\.me\//, "");
  if (target.startsWith("+") || target.toLowerCase().startsWith("joinchat/")) return null;
  return target.toLowerCase();
}
