import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.png.asset.json";
import { BRAND, TAGLINE } from "@/lib/brand";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 sm:flex-row">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoAsset.url} alt="" className="h-8 w-8 rounded-lg object-cover shadow-soft" />
          <span className="font-display text-base font-semibold">{BRAND}</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#dung-thu" className="hover:text-primary">
            Dùng thử
          </a>
          <a href="#bat-dau" className="hover:text-primary">
            Bắt đầu
          </a>
          <Link to="/auth" className="hover:text-primary">
            Đăng nhập
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND} · {TAGLINE}
        </p>
      </div>
    </footer>
  );
}
