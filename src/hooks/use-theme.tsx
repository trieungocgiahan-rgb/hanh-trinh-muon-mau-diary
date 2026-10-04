import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "nkht-theme";

// Chạy sớm trong <head> để trang không nháy sáng/tối khi tải.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;if(d)e.classList.add("dark");var h=localStorage.getItem("nkht-hue");var p=location.pathname;if(h&&p!=="/"&&p!=="/auth"){var a=h.split(",");e.style.setProperty("--h",a[0]);if(a[1])e.style.setProperty("--hm",a[1]);if(a[2])e.style.setProperty("--h2",a[2])}e.style.colorScheme=d?"dark":"light"}catch(_){}})()`;

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch {
    /* bỏ qua: trình duyệt chặn localStorage */
  }
  return "light";
}

function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(readTheme());
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* bỏ qua */
    }
    setThemeState(next);
    applyTheme(next);
  }, []);

  return { theme, setTheme };
}
