import { useReveal } from "@/hooks/use-reveal";
import { useI18n, type Key } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

// Bản nháp: thay bằng kế hoạch thật của nhóm trong bộ chữ (direction.*).
const MILESTONES: { badge: Key; title: Key; body: Key }[] = [
  { badge: "direction.m1.badge", title: "direction.m1.title", body: "direction.m1.body" },
  { badge: "direction.m2.badge", title: "direction.m2.title", body: "direction.m2.body" },
  { badge: "direction.m3.badge", title: "direction.m3.title", body: "direction.m3.body" },
];

function Milestone({ m, first }: { m: (typeof MILESTONES)[number]; first: boolean }) {
  const { t } = useI18n();
  const { ref, shown } = useReveal<HTMLLIElement>(0.4);
  return (
    <li ref={ref} className="relative pb-10 pl-9 last:pb-0">
      <span
        aria-hidden
        className={`absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 transition-colors duration-500 ${
          shown || first ? "border-primary bg-primary" : "border-border bg-[var(--page-tint)]"
        }`}
      />
      <p className="text-sm font-semibold text-primary-ink">{t(m.badge)}</p>
      <h3 className="mt-1 font-display text-2xl font-semibold leading-snug">{t(m.title)}</h3>
      <p className="mt-1.5 max-w-md leading-7 text-foreground/70">{t(m.body)}</p>
    </li>
  );
}

export function LandingDirection() {
  const { t } = useI18n();
  return (
    <section id="huong-di" className="scroll-mt-24 bg-[var(--page-tint)] py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {t("direction.title1")} <em className="font-medium italic text-primary">{nb(t("direction.title2"))}</em>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-foreground/75">{t("direction.intro")}</p>
        </div>

        <ol className="relative">
          <span aria-hidden className="absolute bottom-3 left-[6px] top-3 w-px bg-border" />
          {MILESTONES.map((m, i) => (
            <Milestone key={m.title} m={m} first={i === 0} />
          ))}
        </ol>
      </div>
    </section>
  );
}
