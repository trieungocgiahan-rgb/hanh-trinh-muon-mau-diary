import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarStack } from "@/components/illustrations/People";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, "\u00A0$1");

export function LandingCTA() {
  const { t } = useI18n();
  return (
    <section className="px-5 pb-16 sm:pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
        <svg aria-hidden viewBox="0 0 400 300" className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 opacity-25">
          <path d="M60 80 C40 10 180 -20 280 30 C380 70 400 200 300 250 C200 310 60 280 30 190 C10 140 80 130 60 80Z" fill="#fff" />
        </svg>
        <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute bottom-6 right-10 hidden h-16 w-16 text-[#ffd166] sm:block">
          <path d="M50 4 C54 30 66 42 96 50 C66 58 54 70 50 96 C46 70 34 58 4 50 C34 42 46 30 50 4Z" fill="currentColor" />
        </svg>
        <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <AvatarStack className="h-10" ring="var(--primary)" />
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
              {t("cta.title1")} {nb(t("cta.title2"))}
            </h2>
            <p className="mt-3 text-primary-foreground/90">{t("cta.sub")}</p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 bg-white text-[#a8284f] shadow-pop hover:bg-white/90"
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
