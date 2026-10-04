import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.png.asset.json";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

export function LandingFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 sm:flex-row">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoAsset.url} alt="" className="h-8 w-8 rounded-lg object-cover shadow-soft" />
          <span className="font-display text-base font-semibold">{BRAND}</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#dung-thu" className="hover:text-primary">
            {t("landing.nav.demo")}
          </a>
          <a href="#bat-dau" className="hover:text-primary">
            {t("landing.nav.start")}
          </a>
          <Link to="/auth" className="hover:text-primary">
            {t("common.signIn")}
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND} · {t("brand.tagline")}
        </p>
      </div>
    </footer>
  );
}
