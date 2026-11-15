import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

// Bản nháp: thay bằng kế hoạch thật của nhóm trong bộ chữ (direction.*).
const MILESTONES = [
  { badge: "direction.m1.badge", title: "direction.m1.title", body: "direction.m1.body" },
  { badge: "direction.m2.badge", title: "direction.m2.title", body: "direction.m2.body" },
  { badge: "direction.m3.badge", title: "direction.m3.title", body: "direction.m3.body" },
] as const;

export function LandingDirection() {
  const { t } = useI18n();
  return (
    <section id="huong-di" className="relative scroll-mt-24 overflow-hidden bg-[var(--page-tint)] py-16 sm:py-24">
      <span aria-hidden className="orb -right-24 top-0 h-80 w-80" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
            {t("direction.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            {t("direction.title1")} <span className="text-primary">{nb(t("direction.title2"))}</span>
          </h2>
          <p className="mt-5 max-w-md leading-7 text-muted-foreground">{t("direction.intro")}</p>
        </div>

        <ol className="divide-y divide-border border-y border-border">
          {MILESTONES.map((m, i) => (
            <li key={m.title} className="flex gap-5 py-6">
              <span
                className={`mt-0.5 h-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  i === 0 ? "bg-primary text-primary-foreground shadow-btn" : "bg-card text-muted-foreground"
                }`}
              >
                {t(m.badge)}
              </span>
              <div>
                <h3 className="font-display text-xl font-bold leading-snug">{t(m.title)}</h3>
                <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{t(m.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
