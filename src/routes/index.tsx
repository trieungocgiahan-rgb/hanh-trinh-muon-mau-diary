import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import logoAsset from "@/assets/logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingWhy } from "@/components/landing/LandingWhy";
import { LandingMoments } from "@/components/landing/LandingMoments";
import { LandingStats } from "@/components/landing/LandingStats";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

const SITE = "https://hanh-trinh-muon-mau-diary.lovable.app";
const TITLE = "Nhật Ký Hành Trình — Hành trình muôn màu của dự án cộng đồng";
const DESC =
  "Nơi cả đội ghi lại từng hoạt động, ảnh và cảm xúc của dự án cộng đồng — xem theo lịch, thả tim, bình luận và cùng nhau nhìn lại hành trình.";

export const Route = createFileRoute("/")({
  head: () => ({
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
          name: "Nhật Ký Hành Trình",
          url: SITE,
          description: DESC,
        }),
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/lich", replace: true });
  }, [session, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoAsset.url}
              alt="Nhật Ký Hành Trình"
              className="h-9 w-9 rounded-xl object-cover shadow-soft"
            />
            <span className="font-display text-lg font-extrabold text-foreground">
              Nhật Ký Hành Trình
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#ve-chung-toi" className="hover:text-primary">
              Vì sao
            </a>
            <a href="#khoanh-khac" className="hover:text-primary">
              Khoảnh khắc
            </a>
            <a href="#cam-nhan" className="hover:text-primary">
              Cảm nhận
            </a>
          </nav>

          <Button asChild variant="hero" size="sm">
            <Link to="/auth">Đăng nhập</Link>
          </Button>
        </div>
      </header>

      <main>
        <LandingHero />
        <LandingWhy />
        <LandingMoments />
        <LandingStats />
        <LandingTestimonials />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
