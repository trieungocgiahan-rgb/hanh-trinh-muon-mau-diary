import { CalendarPlus, FileDown, Heart, Images, Palette, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { useI18n } from "@/lib/i18n";
import type { Key } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

// Lưới ô không đều: ô lớn có hình nhỏ minh họa, ô nhỏ chỉ chữ.
function MiniCalendar() {
  const marks = new Set([3, 8, 10, 15, 19, 24]);
  return (
    <div className="mt-6 grid grid-cols-7 gap-1.5" aria-hidden>
      {Array.from({ length: 21 }, (_, i) => (
        <span
          key={i}
          className={`flex h-7 items-center justify-center rounded-md text-[10px] ${
            marks.has(i + 1) ? "bg-primary font-bold text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {i + 1}
        </span>
      ))}
    </div>
  );
}

function MiniMedia() {
  return (
    <div className="mt-6 flex items-end gap-1.5" aria-hidden>
      {[34, 54, 40, 62, 46].map((h, i) => (
        <span key={i} className="flex-1 rounded-lg bg-secondary" style={{ height: h }} />
      ))}
      <span className="ml-2 flex h-8 items-center gap-[3px]">
        {[6, 14, 9, 18, 8, 13, 6].map((h, i) => (
          <span key={i} className="w-[3px] rounded-full bg-primary" style={{ height: h }} />
        ))}
      </span>
    </div>
  );
}

type Tile = { icon: typeof Heart; title: Key; body: Key; span: string; tone: string; extra?: ReactNode };

export function LandingFeatures() {
  const { t } = useI18n();
  const tiles: Tile[] = [
    { icon: CalendarPlus, title: "features.f1.title", body: "features.f1.body", tone: "bg-secondary text-secondary-foreground", span: "lg:col-span-3", extra: <MiniCalendar /> },
    { icon: Images, title: "features.f2.title", body: "features.f2.body", tone: "bg-cool text-cool-ink", span: "lg:col-span-3", extra: <MiniMedia /> },
    { icon: Heart, title: "features.f3.title", body: "features.f3.body", tone: "bg-amber-soft text-amber-ink", span: "lg:col-span-2" },
    { icon: ShieldCheck, title: "features.f5.title", body: "features.f5.body", tone: "bg-tang-soft text-tang-ink", span: "lg:col-span-2" },
    { icon: FileDown, title: "features.f4.title", body: "features.f4.body", tone: "bg-secondary text-secondary-foreground", span: "lg:col-span-2" },
    { icon: Palette, title: "features.f6.title", body: "features.f6.body", tone: "bg-cool text-cool-ink", span: "lg:col-span-6" },
  ];
  return (
    <section id="tinh-nang" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cool-ink">
            {t("features.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            {t("features.title1")} <span className="text-primary">{nb(t("features.title2"))}</span>
          </h2>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {tiles.map((f, i) => (
            <li
              key={f.title}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
              className={`spotlight surface surface-lift rounded-3xl p-6 ${f.span} ${f.span.includes("col-span-6") ? "sm:col-span-2" : ""}`}
            >
              <div className="flex items-start gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${f.tone}`}>
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">{t(f.title)}</h3>
                  <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{t(f.body)}</p>
                </div>
              </div>
              {f.extra}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
