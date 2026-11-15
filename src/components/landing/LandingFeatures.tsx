import { CalendarPlus, FileDown, Images, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, "\u00A0$1");
const FEATURES = [
  { icon: CalendarPlus, title: "features.f1.title", body: "features.f1.body", chip: "bg-primary text-primary-foreground", tilt: "-rotate-1" },
  { icon: Images, title: "features.f2.title", body: "features.f2.body", chip: "bg-[#ffc94d] text-[#4a3500]", tilt: "rotate-1" },
  { icon: Users, title: "features.f3.title", body: "features.f3.body", chip: "bg-[#5fd3ad] text-[#073d2c]", tilt: "-rotate-1" },
  { icon: FileDown, title: "features.f4.title", body: "features.f4.body", chip: "bg-[#a68bff] text-white", tilt: "rotate-1" },
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
            <li
              key={f.title}
              className={`surface rounded-3xl p-6 transition-transform duration-200 hover:rotate-0 ${f.tilt}`}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.chip}`}>
                  <f.icon className="h-6 w-6" aria-hidden />
                </span>
                <span className="font-display text-3xl font-bold text-muted-foreground/40">
                  {i + 1}
                </span>
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
