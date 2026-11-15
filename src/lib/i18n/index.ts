import { useCallback } from "react";
import { en, type Key } from "./en";

export type { Key };
export type Params = Record<string, string | number>;

// Giao diện chỉ có tiếng Anh. Nội dung người dùng nhập vào thì giữ nguyên.
export type Lang = "en";

export function translate(_lang: Lang, key: Key, params?: Params): string {
  let text: string = en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

// Dùng ngoài React (tiêu đề tab, hàm tiện ích).
export function tNow(key: Key, params?: Params): string {
  return translate("en", key, params);
}

export function localeOf(_lang: Lang) {
  return "en-US";
}

export function useLang(): Lang {
  return "en";
}

export function useI18n() {
  const t = useCallback((key: Key, params?: Params) => translate("en", key, params), []);
  return { lang: "en" as Lang, t, locale: "en-US" };
}
