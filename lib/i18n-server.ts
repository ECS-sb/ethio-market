import type { Metadata } from "next";
import { lang } from "next/root-params";
import { createT, isLocale, type Locale, type MessageKey } from "@/lib/i18n";

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : "en";
}

export async function getT() {
  return createT(await getLocale());
}

export function pageTitle(key: MessageKey) {
  return async (): Promise<Metadata> => {
    const t = await getT();
    return { title: t(key) };
  };
}
