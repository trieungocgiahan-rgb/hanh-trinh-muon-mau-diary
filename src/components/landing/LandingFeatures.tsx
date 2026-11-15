import { CalendarPlus, FileDown, Images, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, "\u00A0$1");
const FEATURES = [
  { icon: CalendarPlus, title: "features.f1.title", body: "features.f1.body" },
  { icon: Images, title: "features.f2.title", body: "features.f2.body" },
  { icon: Users, title: "features.f3.title", body: "features.f3.body" },
  { icon: FileDown, title: "features.f4.title", body: "features.f4.body" },
] as const;

export function LandingFeatures() {
  const { t } = useI18n();
  return (
    <section id="tinh-nang" className="scroll-mt-20 bg-[var(--page-tint)] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {t("features.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
            {nb(t("features.title1"))} <span className="text-primary">{nb(t("features.title2"))}</span>
          </h2>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <li key={f.title} className="surface rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <f.icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{t(f.title)}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t(f.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
