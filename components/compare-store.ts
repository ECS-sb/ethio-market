"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "ethio-market-compare";
export const MAX_COMPARE = 4;

const listeners = new Set<() => void>();
let memoryValue = "";

function read(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memoryValue;
  } catch {
    return memoryValue;
  }
}

function write(value: string) {
  memoryValue = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ማከማቻ ካልተፈቀደ በሜሞሪ ብቻ ይቀጥላል።
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useCompare() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const ids = useMemo(() => (raw ? raw.split(",") : []), [raw]);

  const toggle = useCallback(
    (id: string): "added" | "removed" | "full" => {
      if (ids.includes(id)) {
        write(ids.filter((item) => item !== id).join(","));
        return "removed";
      }
      if (ids.length >= MAX_COMPARE) return "full";
      write([...ids, id].join(","));
      return "added";
    },
    [ids]
  );

  const clear = useCallback(() => write(""), []);

  return { ids, toggle, clear };
}
