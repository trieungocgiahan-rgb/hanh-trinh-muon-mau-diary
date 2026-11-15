import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

// Nội dung hướng đi là bản nháp: thay bằng kế hoạch thật của nhóm trong bộ dịch (direction.*).
const MILESTONES = [
  { badge: "direction.m1.badge", title: "direction.m1.title", body: "direction.m1.body", now: true },
  { badge: "direction.m2.badge", title: "direction.m2.title", body: "direction.m2.body", now: false },
  { badge: "direction.m3.badge", title: "direction.m3.title", body: "direction.m3.body", now: false },
] as const;

export function LandingDirection() {
  const { t } = useI18n();
  return (
    <section id="huong-di" className="relative scroll-mt-24 overflow-hidden bg-[var(--page-tint)] py-16 sm:py-24">
      <span aria-hidden className="orb -right-24 top-0 h-80 w-80" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
            {t("direction.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            {t("direction.title1")} <span className="text-primary">{nb(t("direction.title2"))}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {t("direction.intro")}
          </p>
        </div>

        <ol className="relative mt-12 grid gap-4 lg:grid-cols-3">
          {MILESTONES.map((m, i) => (
            <li
              key={m.title}
              className={`rounded-3xl p-6 ${m.now ? "glass glow-pink" : "glass"}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    m.now ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {t(m.badge)}
                </span>
                <span className="font-display text-4xl font-extrabold text-primary/25">{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold leading-snug">{t(m.title)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(m.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
