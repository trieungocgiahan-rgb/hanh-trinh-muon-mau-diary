import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

export function LandingCTA() {
  const { t } = useI18n();
  return (
    <section className="px-5 pb-16 sm:pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground shadow-[0_30px_80px_-30px_var(--glow)] sm:px-14 sm:py-20">
        <span aria-hidden className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <span aria-hidden className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
              {t("cta.title1")} {nb(t("cta.title2"))}
            </h2>
            <p className="mt-3 text-lg text-primary-foreground/90">{t("cta.sub")}</p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 bg-white text-[oklch(0.5_0.22_357)] shadow-pop hover:bg-white/90"
          >
            <Link to="/auth">
              {t("common.enterJournal")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
