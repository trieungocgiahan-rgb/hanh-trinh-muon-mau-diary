import { Clock3, MessagesSquare, Unplug } from "lucide-react";
import { GlobeFallback } from "@/components/illustrations/Fallbacks";
import { SlotImage } from "@/components/illustrations/SlotImage";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

const PROBLEMS = [
  { icon: MessagesSquare, title: "problem.p1.title", body: "problem.p1.body" },
  { icon: Clock3, title: "problem.p2.title", body: "problem.p2.body" },
  { icon: Unplug, title: "problem.p3.title", body: "problem.p3.body" },
] as const;

export function LandingProblem() {
  const { t } = useI18n();
  return (
    <section id="van-de" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
            {t("problem.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            {t("problem.title1")} <span className="text-primary">{nb(t("problem.title2"))}</span>
          </h2>

          <ul className="mt-8 space-y-3">
            {PROBLEMS.map((p) => (
              <li key={p.title} className="surface flex gap-4 rounded-2xl p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <p.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold">{t(p.title)}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(p.body)}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-8 border-l-4 border-primary pl-4 text-lg font-semibold leading-snug text-foreground">
            {t("problem.solution")}
          </p>
        </div>

        <div className="relative">
          <span aria-hidden className="orb left-1/4 top-1/4 h-64 w-64" />
          <SlotImage
            src="/images/globe-connect.png"
            alt={t("problem.visualAlt")}
            fallback={<GlobeFallback className="relative mx-auto w-full max-w-md" />}
            className="relative mx-auto w-full max-w-md object-contain drop-shadow-[0_24px_40px_var(--glow)]"
          />
        </div>
      </div>
    </section>
  );
}
