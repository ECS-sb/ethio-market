import { am, type MessageKey } from "@/lib/messages";

export type { MessageKey };
export type Locale = "en" | "am";

export const locales: Locale[] = ["en", "am"];

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "am";
}

/** የትርጉም ቁልፉ እንግሊዝኛው ጽሑፍ ራሱ ነው፤ `{name}` ቦታ ያዥ ነው። */
export function createT(locale: Locale) {
  return (key: MessageKey, vars?: Record<string, string | number>): string => {
    const text: string = locale === "am" ? am[key] : key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
  };
}

export type T = ReturnType<typeof createT>;

export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/(en|am)(?=\/|$)/, "");
  return stripped || "/";
}

export function localePath(locale: Locale, path: string): string {
  if (locale === "en" || !path.startsWith("/") || path.startsWith("//")) return path;
  return path === "/" ? "/am" : `/am${path}`;
}
