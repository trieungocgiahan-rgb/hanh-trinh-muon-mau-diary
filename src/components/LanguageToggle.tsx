import { useI18n, type Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; short: string; labelKey: "lang.vi" | "lang.en" }[] = [
  { value: "vi", short: "VI", labelKey: "lang.vi" },
  { value: "en", short: "EN", labelKey: "lang.en" },
];

// Công tắc ngôn ngữ nhỏ gọn cho trang giới thiệu và đăng nhập.
export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="radiogroup"
      aria-label={t("lang.switch")}
      className="flex items-center rounded-full border border-border bg-card/70 p-0.5 text-xs font-semibold"
    >
      {OPTIONS.map((o) => {
        const on = lang === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={t(o.labelKey)}
            onClick={() => setLang(o.value)}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              on ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.short}
          </button>
        );
      })}
    </div>
  );
}
