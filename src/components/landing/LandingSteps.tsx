import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import desk from "@/assets/landing-desk.jpg";
import { useI18n } from "@/lib/i18n";

const steps = [
  { n: "1", title: "steps.s1.title", body: "steps.s1.body" },
  { n: "2", title: "steps.s2.title", body: "steps.s2.body" },
  { n: "3", title: "steps.s3.title", body: "steps.s3.body" },
] as const;

export function LandingSteps() {
  const { t } = useI18n();
  return (
    <section
      id="bat-dau"
      className="scroll-mt-20 bg-background py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <img
          src={desk}
          alt={t("steps.alt")}
          width={1200}
          height={912}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-2xl object-cover shadow-pop"
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {t("steps.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
            {t("steps.title1")}{" "}
            <span className="text-primary">{t("steps.title2")}</span>
          </h2>

          <ol className="mt-8 divide-y divide-border border-y border-border">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-5 py-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{t(s.title)}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(s.body)}</p>
                </div>
              </li>
            ))}
          </ol>

          <Button asChild variant="hero" size="lg" className="mt-8">
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
