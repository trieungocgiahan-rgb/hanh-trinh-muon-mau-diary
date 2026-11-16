import { Reveal } from "@/components/Reveal";
import { RotatingGlobe } from "@/components/globe/RotatingGlobe";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, "\u00A0$1");

export function LandingProblem() {
  const { t } = useI18n();
  return (
    <section id="van-de" className="relative scroll-mt-24 overflow-hidden bg-background py-16 sm:py-24">
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
        <div className="order-2 mx-auto w-full max-w-md lg:order-1 lg:max-w-none">
          <RotatingGlobe className="w-full" />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {t("problem.title1")} <em className="font-medium italic text-primary">{nb(t("problem.title2"))}</em>
          </h2>
          <Reveal>
            <p className="mt-6 max-w-lg text-lg leading-8 text-foreground/80">{t("problem.body")}</p>
            <p className="mt-6 max-w-lg font-display text-2xl font-medium leading-snug">{t("problem.solution")}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
