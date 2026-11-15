import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

const STEPS = [
  { title: "steps.s1.title", body: "steps.s1.body" },
  { title: "steps.s2.title", body: "steps.s2.body" },
  { title: "steps.s3.title", body: "steps.s3.body" },
] as const;

export function LandingCTA() {
  const { t } = useI18n();
  return (
    <section id="bat-dau" className="scroll-mt-24 px-5 pb-16 sm:pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground shadow-[0_30px_80px_-30px_var(--glow)] sm:px-12 sm:py-16">
        <span aria-hidden className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              {t("cta.title1")} {nb(t("cta.title2"))}
            </h2>
            <p className="mt-3 text-lg text-primary-foreground/90">{t("cta.sub")}</p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-white text-[oklch(0.5_0.22_357)] shadow-pop hover:bg-white/90"
            >
              <Link to="/auth">
                {t("common.enterJournal")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
              {t("steps.eyebrow")}: {t("steps.title1")} {t("steps.title2")}
            </p>
            <ol className="space-y-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[oklch(0.5_0.22_357)]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{t(s.title)}</p>
                    <p className="mt-0.5 text-sm text-primary-foreground/85">{t(s.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
