// Màu chủ đạo của từng dự án. `hue` là góc màu chính; `hm` và `h2` là hai điểm màu
// còn lại của dải gradient (bỏ trống thì tự suy ra từ `hue`, đúng dải san hô ban đầu).
export const PROJECT_THEMES = [
  { key: "coral", label: "San hô", hue: 28 },
  { key: "sunset", label: "Hoàng hôn", hue: 58 },
  { key: "forest", label: "Rừng xanh", hue: 155, hm: 175, h2: 215 },
  { key: "ocean", label: "Biển", hue: 235, hm: 255, h2: 295 },
  { key: "grape", label: "Tím mộng mơ", hue: 305, hm: 330, h2: 360 },
  { key: "rose", label: "Hồng đào", hue: 355 },
] as const;

export type ProjectThemeKey = (typeof PROJECT_THEMES)[number]["key"];

export const DEFAULT_HUE = 28;
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
