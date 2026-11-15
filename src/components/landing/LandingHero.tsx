import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDiary } from "./HeroDiary";
import { useI18n } from "@/lib/i18n";


export function LandingHero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-[var(--page-tint)] pb-24 pt-28 sm:pb-32 sm:pt-36">
      <span aria-hidden className="orb -left-24 top-10 h-72 w-72" />
      <span aria-hidden className="orb-cool -right-24 top-20 h-96 w-96" />
      <span aria-hidden className="orb-amber bottom-0 right-1/4 h-72 w-72" />
      <span aria-hidden className="orb bottom-0 right-1/3 h-72 w-72" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="min-w-0">
          <h1 className="text-balance font-display text-[2.5rem] font-extrabold leading-[1.03] tracking-tight text-foreground sm:text-5xl lg:text-[3.6rem]">
            {t("hero.l1")}
            <br />
            <span className="text-primary">{t("hero.l2")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t("hero.sub")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/auth">
                {t("hero.primary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="glass w-full border-0 sm:w-auto">
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
