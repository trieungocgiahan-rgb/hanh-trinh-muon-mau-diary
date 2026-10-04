import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useI18n } from "@/lib/i18n";

// Nút đổi nhanh sáng/tối cho trang giới thiệu và đăng nhập.
export function ThemeToggle() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? t("themeMode.toLight") : t("themeMode.toDark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
