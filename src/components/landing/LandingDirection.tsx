import { useReveal } from "@/hooks/use-reveal";
import { useI18n, type Key } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, "\u00A0$1");

// Bản nháp: thay bằng kế hoạch thật của nhóm trong bộ chữ (direction.*).
const MILESTONES: { badge: Key; title: Key; body: Key; tone: string; dot: string }[] = [
  { badge: "direction.m1.badge", title: "direction.m1.title", body: "direction.m1.body", tone: "bg-primary text-primary-foreground shadow-btn", dot: "bg-primary" },
  { badge: "direction.m2.badge", title: "direction.m2.title", body: "direction.m2.body", tone: "bg-cool text-cool-ink", dot: "bg-[var(--cool-ink)]" },
  { badge: "direction.m3.badge", title: "direction.m3.title", body: "direction.m3.body", tone: "bg-amber-soft text-amber-ink", dot: "bg-[var(--amber)]" },
];

function Milestone({ m }: { m: (typeof MILESTONES)[number] }) {
  const { t } = useI18n();
  const { ref, shown } = useReveal<HTMLLIElement>(0.4);
  return (
    <li ref={ref} className="relative flex gap-5 pb-10 pl-8 last:pb-0">
      {/* nút nối trên sợi chỉ: sáng lên khi cuộn tới */}
      <span
        aria-hidden
        className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-[var(--page-tint)] transition-all duration-500 ${
          shown ? `${m.dot} scale-100 shadow-[0_0_14px_var(--glow)]` : "scale-75 bg-border"
        }`}
      />
      <div className={`transition-all duration-500 ${shown ? "translate-x-0 opacity-100" : "translate-x-3 opacity-40"}`}>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${m.tone}`}>{t(m.badge)}</span>
        <h3 className="mt-3 font-display text-xl font-bold leading-snug">{t(m.title)}</h3>
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{t(m.body)}</p>
      </div>
    </li>
  );
}

export function LandingDirection() {
  const { t } = useI18n();
  return (
    <section id="huong-di" className="relative scroll-mt-24 overflow-hidden bg-[var(--page-tint)] py-16 sm:py-24">
      <span aria-hidden className="orb -right-24 top-0 h-80 w-80" />
      <span aria-hidden className="orb-amber -left-20 bottom-0 h-72 w-72" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-ink">
            {t("direction.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            {t("direction.title1")} <span className="text-primary">{nb(t("direction.title2"))}</span>
          </h2>
          <p className="mt-5 max-w-md leading-7 text-muted-foreground">{t("direction.intro")}</p>
        </div>

        <ol className="relative">
          {/* sợi chỉ dọc nối ba mốc */}
          <span aria-hidden className="thread-v absolute bottom-2 left-[6px] top-3 w-[2px] opacity-70" />
          {MILESTONES.map((m) => (
            <Milestone key={m.title} m={m} />
          ))}
        </ol>
      </div>
    </section>
  );
}
