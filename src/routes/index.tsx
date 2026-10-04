import { ThemeToggle } from "@/components/ThemeToggle";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import logoAsset from "@/assets/logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingDemo } from "@/components/landing/LandingDemo";
import { LandingSteps } from "@/components/landing/LandingSteps";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BRAND } from "@/lib/brand";
import { useI18n, tNow } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

const SITE = "https://hanh-trinh-muon-mau-diary.lovable.app";

export const Route = createFileRoute("/")({
  head: () => {
    const TITLE = `${BRAND} — ${tNow("brand.taglineLong")}`;
    const DESC = tNow("landing.seoDesc");
    return {
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: SITE }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: BRAND,
          url: SITE,
          description: DESC,
        }),
      },
    ],
    };
  },
  component: LandingPage,
});

function LandingPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/lich", replace: true });
  }, [session, loading, navigate]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 shadow-[0_1px_0_var(--hi)_inset,0_8px_24px_-18px_oklch(0.46_0.1_30/0.35)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoAsset.url}
              alt={BRAND}
              className="h-10 w-10 rounded-lg object-cover shadow-soft"
            />
            <span className="font-display text-lg font-semibold text-foreground">{BRAND}</span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium text-muted-foreground sm:flex">
            <a
              href="#dung-thu"
              className="rounded-full px-4 py-2 transition-colors hover:bg-secondary hover:text-primary"
            >
              {t("landing.nav.demo")}
            </a>
            <a
              href="#bat-dau"
              className="rounded-full px-4 py-2 transition-colors hover:bg-secondary hover:text-primary"
            >
              {t("landing.nav.start")}
            </a>
          </nav>

          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
            <Button asChild variant="hero" size="sm">
              <Link to="/auth">{t("common.signIn")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <LandingHero />
        <LandingDemo />
        <LandingSteps />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
