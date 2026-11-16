import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const STEPS = [
  { title: "steps.s1.title", body: "steps.s1.body" },
  { title: "steps.s2.title", body: "steps.s2.body" },
  { title: "steps.s3.title", body: "steps.s3.body" },
] as const;

export function LandingCTA() {
  const { t } = useI18n();
  return (
    <section id="bat-dau" className="scroll-mt-24 px-5 pb-16 sm:pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
        {/* hai vòng giao nhau, giống biểu tượng của Together */}
        <svg aria-hidden viewBox="0 0 400 240" className="pointer-events-none absolute -bottom-24 -right-20 w-[26rem] text-white opacity-15">
          <circle cx="140" cy="140" r="110" fill="none" stroke="currentColor" strokeWidth="14" />
          <circle cx="260" cy="140" r="110" fill="none" stroke="currentColor" strokeWidth="14" />
        </svg>
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {t("cta.title1")} <em className="font-medium italic">{t("cta.title2")}</em>
            </h2>
            <p className="mt-3 text-lg text-primary-foreground/90">{t("cta.sub")}</p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-white text-[oklch(0.5_0.22_357)] shadow-none hover:bg-white/90"
            >
              <Link to="/auth">
                {t("common.enterJournal")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ol className="space-y-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="font-display text-3xl font-medium italic leading-none text-primary-foreground/70">
                  {i + 1}.
                </span>
                <div>
                  <p className="text-lg font-semibold leading-tight">{t(s.title)}</p>
                  <p className="mt-1 leading-7 text-primary-foreground/85">{t(s.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
