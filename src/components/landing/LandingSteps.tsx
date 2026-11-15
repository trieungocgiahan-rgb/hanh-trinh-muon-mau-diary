import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

const steps = [
  { n: "1", title: "steps.s1.title", body: "steps.s1.body" },
  { n: "2", title: "steps.s2.title", body: "steps.s2.body" },
  { n: "3", title: "steps.s3.title", body: "steps.s3.body" },
] as const;

export function LandingSteps() {
  const { t } = useI18n();
  return (
    <section id="bat-dau" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
            {t("steps.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            {t("steps.title1")} <span className="text-primary">{nb(t("steps.title2"))}</span>
          </h2>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="surface rounded-3xl p-6">
              <span className="font-display text-5xl font-extrabold text-primary text-glow">{s.n}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{t(s.title)}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t(s.body)}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
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
