// የቴሌግራም ገጹ የአቀማመጥ ምርጫዎች (ቁጥሮቹ ተደብቀዋል? የቻት ዝርዝሩ ስፋት)፤ በcookie ይታወሳሉ። ምንም database አይጠቀምም።

export const STATS_COOKIE = "tg_stats";
export const LIST_COOKIE = "tg_list";
export const LIST_MIN = 260;
export const LIST_MAX = 640;
export const LIST_DEFAULT = 352;

export function clampListWidth(value: number): number {
  return Number.isFinite(value) ? Math.min(LIST_MAX, Math.max(LIST_MIN, Math.round(value))) : LIST_DEFAULT;
}

export function readLayoutPrefs(get: (name: string) => string | undefined) {
  const width = get(LIST_COOKIE);
  return {
    statsOpen: get(STATS_COOKIE) !== "hidden",
    listWidth: width ? clampListWidth(Number(width)) : LIST_DEFAULT,
  };
}

export function saveLayoutPref(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}
