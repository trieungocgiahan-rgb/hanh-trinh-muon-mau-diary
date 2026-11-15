import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/BrandMark";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

export function LandingFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="h-8 w-8" />
            <span className="font-display text-base font-bold">{BRAND}</span>
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{t("footer.line")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <a href="#tinh-nang" className="hover:text-primary-ink">
            {t("landing.nav.features")}
          </a>
          <a href="#dung-thu" className="hover:text-primary-ink">
            {t("landing.nav.demo")}
          </a>
          <a href="#huong-di" className="hover:text-primary-ink">
            {t("landing.nav.direction")}
          </a>
          <Link to="/auth" className="hover:text-primary-ink">
            {t("common.signIn")}
          </Link>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-5 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {BRAND}
      </p>
    </footer>
  );
}
