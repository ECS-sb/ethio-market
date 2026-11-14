// የቻት ዝርዝርና የመልዕክት ሰዓቶች በአዲስ አበባ ሰዓት። ምንም database አይጠቀምም።

const TIME_ZONE = "Africa/Addis_Ababa";
const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const shortDateFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric", month: "short" });
const longDateFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric", month: "long", year: "numeric" });

/** በአዲስ አበባ ሰዓት የቀኑ መለያ (2026-11-14)፤ መልዕክቶችን በቀን ለመመደብ። */
export function dayKey(date: Date): string {
  return dayFormat.format(date);
}

/** ዛሬ ከሆነ ሰዓቱ (14:05)፣ ካልሆነ ቀኑ (14 Nov)፤ እንደ ቴሌግራም የቻት ዝርዝር። */
export function chatListTime(date: Date, now: Date): string {
  return dayKey(date) === dayKey(now) ? timeFormat.format(date) : shortDateFormat.format(date);
}

/**
 * ቴሌግራም የደንበኛውን "online" ሁኔታ ለቦቶች አይሰጥም፤ ስለዚህ የደንበኛው የመጨረሻ መልዕክት
 * በ5 ደቂቃ ውስጥ ከሆነ "አሁን ንቁ" ተብሎ ይቆጠራል።
 */
export function isRecentlyActive(lastInboundAt: Date | null, now: Date): boolean {
  return lastInboundAt !== null && now.getTime() - lastInboundAt.getTime() < 5 * 60 * 1000;
}

export function messageTime(date: Date): string {
  return timeFormat.format(date);
}

export function dayLabel(date: Date): string {
  return longDateFormat.format(date);
}

/** የስሙ የመጀመሪያ ፊደሎች (ቢበዛ ሁለት)፤ አማርኛ፣ ኢሞጂ እና ምልክቶችም ይሰራሉ። */
export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const letters = words.slice(0, 2).map((word) => Array.from(word)[0] ?? "");
  return letters.join("").toUpperCase() || "?";
}
