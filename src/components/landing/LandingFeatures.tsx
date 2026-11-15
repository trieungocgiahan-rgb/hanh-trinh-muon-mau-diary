import { CalendarPlus, FileDown, Images, Palette, ShieldCheck, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

const FEATURES = [
  { icon: CalendarPlus, title: "features.f1.title", body: "features.f1.body" },
  { icon: Images, title: "features.f2.title", body: "features.f2.body" },
  { icon: Users, title: "features.f3.title", body: "features.f3.body" },
  { icon: ShieldCheck, title: "features.f5.title", body: "features.f5.body" },
  { icon: FileDown, title: "features.f4.title", body: "features.f4.body" },
  { icon: Palette, title: "features.f6.title", body: "features.f6.body" },
] as const;

export function LandingFeatures() {
  const { t } = useI18n();
  return (
    <section id="tinh-nang" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
            {t("features.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            {t("features.title1")} <span className="text-primary">{nb(t("features.title2"))}</span>
          </h2>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="surface surface-lift rounded-3xl p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-btn">
                <f.icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold">{t(f.title)}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t(f.body)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
