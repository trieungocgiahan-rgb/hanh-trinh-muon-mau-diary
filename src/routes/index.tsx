import { ThemeToggle } from "@/components/ThemeToggle";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingDemo } from "@/components/landing/LandingDemo";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingProblem } from "@/components/landing/LandingProblem";
import { LandingDirection } from "@/components/landing/LandingDirection";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BRAND } from "@/lib/brand";
import { useI18n, tNow } from "@/lib/i18n";

const SITE = "https://toghether.contextuary.app";

const NAV = [
  { href: "#tinh-nang", label: "landing.nav.features" },
  { href: "#dung-thu", label: "landing.nav.demo" },
  { href: "#huong-di", label: "landing.nav.direction" },
  { href: "#bat-dau", label: "landing.nav.start" },
] as const;

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
    if (!loading && session) navigate({ to: "/danh-sach", replace: true });
  }, [session, loading, navigate]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link to="/" className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4">
            <BrandMark className="h-9 w-9 rounded-full" />
            <span className="font-display text-base font-bold text-foreground">{BRAND}</span>
          </Link>

          <nav className="glass hidden items-center gap-1 rounded-full p-1.5 text-sm font-medium text-muted-foreground md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="relative rounded-full px-4 py-2 transition-colors hover:text-primary-ink after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {t(n.label)}
              </a>
            ))}
          </nav>

          <div className="glass flex items-center gap-1.5 rounded-full p-1.5">
            <ThemeToggle />
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth">{t("common.signIn")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <LandingHero />
        <LandingProblem />
        <LandingDemo />
        <LandingFeatures />
        <LandingDirection />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
