// Màu chủ đạo của từng dự án. `hue` là góc màu chính trong oklch.
// Chú ý: `key` đã lưu trong CSDL (ràng buộc CHECK) nên giữ nguyên; chỉ đổi màu hiển thị.
// "coral" là mặc định cũ, nay là xanh ngọc đậm.
export const PROJECT_THEMES = [
  { key: "coral", hue: 200 },
  { key: "sunset", hue: 62 },
  { key: "forest", hue: 150 },
  { key: "ocean", hue: 265 },
  { key: "grape", hue: 330 },
  { key: "rose", hue: 28 },
] as const;

export type ProjectThemeKey = (typeof PROJECT_THEMES)[number]["key"];

export const DEFAULT_HUE = 200;
export const HUE_STORAGE_KEY = "nkht-hue";

type ThemeDef = { key: string; hue: number; hm?: number; h2?: number };

function findTheme(key: string | null | undefined): ThemeDef {
  return (PROJECT_THEMES as readonly ThemeDef[]).find((t) => t.key === key) ?? PROJECT_THEMES[0];
}

export function themeHue(key: string | null | undefined): number {
  return findTheme(key).hue;
}

// Ghi các biến màu lên <html>; dùng cho cả xem trước ở trang Cài đặt.
export function applyThemeVars(key: string | null | undefined, persist = true) {
  const t = findTheme(key);
  const root = document.documentElement;
  root.style.setProperty("--h", String(t.hue));
  if (t.hm !== undefined) root.style.setProperty("--hm", String(t.hm));
  else root.style.removeProperty("--hm");
  if (t.h2 !== undefined) root.style.setProperty("--h2", String(t.h2));
  else root.style.removeProperty("--h2");
  if (!persist) return;
  try {
    localStorage.setItem(HUE_STORAGE_KEY, `${t.hue},${t.hm ?? ""},${t.h2 ?? ""}`);
  } catch {
    /* bỏ qua */
  }
}

export function clearThemeVars() {
  const root = document.documentElement;
  root.style.removeProperty("--h");
  root.style.removeProperty("--hm");
  root.style.removeProperty("--h2");
}
