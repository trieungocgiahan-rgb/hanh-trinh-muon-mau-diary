import { useCallback, useSyncExternalStore } from "react";
import { vi, type Key } from "./vi";
import { en } from "./en";

export type Lang = "vi" | "en";
export type { Key };
export type Params = Record<string, string | number>;

export const LANG_KEY = "nkht-lang";

const dicts: Record<Lang, Record<Key, string>> = { vi, en };

let current: Lang = "vi";
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "vi" || saved === "en") current = saved;
  } catch {
    /* bỏ qua: trình duyệt chặn localStorage */
  }
}

const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getLang(): Lang {
  return current;
}

export function setLang(next: Lang) {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(LANG_KEY, next);
  } catch {
    /* bỏ qua */
  }
  if (typeof document !== "undefined") document.documentElement.lang = next;
  listeners.forEach((fn) => fn());
}

export function translate(lang: Lang, key: Key, params?: Params): string {
  let text = dicts[lang][key] ?? dicts.vi[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

// Dùng ngoài React (tiêu đề tab, hàm tiện ích): lấy ngôn ngữ hiện tại.
export function tNow(key: Key, params?: Params): string {
  return translate(current, key, params);
}

export function localeOf(lang: Lang) {
  return lang === "vi" ? "vi-VN" : "en-US";
}

export function useLang(): Lang {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => "vi" as Lang,
  );
}

export function useI18n() {
  const lang = useLang();
  const t = useCallback((key: Key, params?: Params) => translate(lang, key, params), [lang]);
  return { lang, t, setLang, locale: localeOf(lang) };
}
