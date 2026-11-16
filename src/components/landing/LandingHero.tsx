import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDiary } from "./HeroDiary";
import { NetworkBackground } from "./NetworkBackground";
import { useI18n } from "@/lib/i18n";

export function LandingHero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-[var(--page-tint)] pb-20 pt-28 sm:pb-28 sm:pt-36">
      {/* nền chuyển sắc nhẹ về phía cuốn sách + dải sáng quét ngang */}
      <span aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_80%_at_74%_46%,var(--hero-wash),transparent_72%)]" />
      {/* lưới liên kết phủ rộng cả nền, nằm dưới chữ và cuốn sách */}
      <NetworkBackground className="pointer-events-none absolute inset-y-0 right-0 w-full overflow-hidden lg:w-[72%] [mask-image:radial-gradient(ellipse_60%_70%_at_58%_46%,#000_0%,rgba(0,0,0,0.55)_45%,transparent_100%)] max-lg:[mask-image:radial-gradient(ellipse_90%_40%_at_50%_92%,#000_0%,rgba(0,0,0,0.5)_50%,transparent_100%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="relative z-10 min-w-0">
          <h1 className="font-display text-[2.8rem] font-semibold leading-[1.04] sm:text-6xl lg:text-[4.1rem]">
            {t("hero.l1")}
            <br />
            <em className="font-medium italic text-primary">{t("hero.l2")}</em>
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-8 text-foreground/75 sm:text-xl sm:leading-9">
            {t("hero.sub")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/auth">
                {t("hero.primary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full bg-card sm:w-auto">
              <a href="#dung-thu">{t("hero.secondary")}</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t("hero.note")}</p>
        </div>

        <HeroDiary />
      </div>
    </section>
  );
}
