import { Reveal } from "@/components/Reveal";
import { RotatingGlobe } from "@/components/globe/RotatingGlobe";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, "\u00A0$1");

const POINTS = [
  { title: "problem.p1.title", body: "problem.p1.body" },
  { title: "problem.p2.title", body: "problem.p2.body" },
  { title: "problem.p3.title", body: "problem.p3.body" },
] as const;

export function LandingProblem() {
  const { t } = useI18n();
  return (
    <section id="van-de" className="relative scroll-mt-24 overflow-hidden bg-background py-16 sm:py-24">
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
        <div className="order-2 mx-auto w-full max-w-md lg:order-1 lg:max-w-none">
          <RotatingGlobe className="w-full" />
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
            {t("problem.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            {t("problem.title1")} <span className="text-primary">{nb(t("problem.title2"))}</span>
          </h2>

          <div className="mt-8 space-y-6">
            {POINTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <h3 className="font-display text-lg font-bold">{t(p.title)}</h3>
                <p className="mt-1 max-w-lg leading-7 text-muted-foreground">{t(p.body)}</p>
              </Reveal>
            ))}
          </div>

          <p className="mt-9 max-w-lg text-xl font-semibold leading-snug text-foreground">
            {t("problem.solution")}
          </p>
        </div>
      </div>
    </section>
  );
}
