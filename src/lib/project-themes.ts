// Màu chủ đạo của từng dự án: `hue` là góc màu, `chroma` là độ đậm trong oklch.
// Chú ý: `key` đã lưu trong CSDL (ràng buộc CHECK) nên giữ nguyên; chỉ đổi màu hiển thị.
// "coral" là mặc định cũ, nay là hồng tươi.
export const PROJECT_THEMES = [
  { key: "coral", hue: 357, chroma: 0.25 },
  { key: "sunset", hue: 55, chroma: 0.15 },
  { key: "forest", hue: 155, chroma: 0.12 },
  { key: "ocean", hue: 265, chroma: 0.17 },
  { key: "grape", hue: 310, chroma: 0.17 },
  { key: "rose", hue: 30, chroma: 0.17 },
] as const;

export type ProjectThemeKey = (typeof PROJECT_THEMES)[number]["key"];

export const DEFAULT_HUE = 357;
export const HUE_STORAGE_KEY = "nkht-hue";

type ThemeDef = { key: string; hue: number; chroma: number };

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
  root.style.setProperty("--pc", String(t.chroma));
  if (!persist) return;
  try {
    localStorage.setItem(HUE_STORAGE_KEY, `${t.hue},${t.chroma}`);
  } catch {
    /* bỏ qua */
  }
}

export function clearThemeVars() {
  const root = document.documentElement;
  root.style.removeProperty("--h");
  root.style.removeProperty("--pc");
}
