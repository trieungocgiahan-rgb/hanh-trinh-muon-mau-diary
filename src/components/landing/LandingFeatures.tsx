import { CalendarPlus, Eye, FileDown, Heart, Images, MessageCircle, Palette, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { PROJECT_THEMES } from "@/lib/project-themes";
import { useI18n } from "@/lib/i18n";
import type { Key } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

// Mỗi ô có một hình minh họa nhỏ dựng bằng HTML/CSS để nhìn là hiểu.

function MiniCalendar() {
  const marks = new Set([3, 8, 10, 15, 19]);
  return (
    <div className="grid grid-cols-7 gap-1.5" aria-hidden>
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
  const colors = ["bg-primary", "bg-azure", "bg-amber", "bg-tang", "bg-primary"];
  return (
    <div className="flex items-end gap-1.5" aria-hidden>
      {[34, 54, 40, 62, 46].map((h, i) => (
        <span key={i} className={`flex-1 rounded-lg ${colors[i]}`} style={{ height: h }} />
      ))}
      <span className="ml-2 flex h-8 items-center gap-[3px]">
        {[6, 14, 9, 18, 8, 13, 6].map((h, i) => (
          <span key={i} className="w-[3px] rounded-full bg-primary" style={{ height: h }} />
        ))}
      </span>
    </div>
  );
}

function MiniReactions() {
  const people = [
    ["D", "bg-primary text-primary-foreground"],
    ["L", "bg-azure text-white"],
    ["J", "bg-amber text-[oklch(0.3_0.06_80)]"],
    ["+4", "bg-muted text-muted-foreground"],
  ];
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="flex -space-x-2">
        {people.map(([l, c]) => (
          <span key={l} className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-card ${c}`}>
            {l}
          </span>
        ))}
      </span>
      <span className="ml-auto flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
        <Heart className="h-3.5 w-3.5 fill-current" /> 12
      </span>
      <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
        <MessageCircle className="h-3.5 w-3.5" /> 3
      </span>
    </div>
  );
}

function MiniRoles() {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap gap-2" aria-hidden>
      <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> {t("role.admin")}
      </span>
      <span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground">
        {t("role.member")}
      </span>
      <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
        <Eye className="h-3.5 w-3.5" /> {t("role.viewer")}
      </span>
    </div>
  );
}

function MiniReport() {
  return (
    <div className="flex justify-center" aria-hidden>
      <div className="w-40 -rotate-2 rounded-lg border border-border bg-card p-2.5 shadow-soft">
        <div className="h-5 rounded bg-primary" />
        <div className="mt-2 flex gap-1.5">
          <span className="h-9 flex-1 rounded bg-azure" />
          <span className="h-9 flex-1 rounded bg-amber" />
        </div>
        <div className="mt-2 space-y-1">
          <span className="block h-1.5 rounded bg-muted" />
          <span className="block h-1.5 w-4/5 rounded bg-muted" />
          <span className="block h-1.5 w-3/5 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function MiniColors() {
  return (
    <div className="flex items-center gap-2.5" aria-hidden>
      {PROJECT_THEMES.map((th, i) => (
        <span
          key={th.key}
          className={`h-8 w-8 rounded-full ${i === 0 ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""}`}
          style={{ background: `oklch(0.66 ${th.chroma} ${th.hue})` }}
        />
      ))}
    </div>
  );
}

type Tile = {
  icon: typeof Heart;
  title: Key;
  body: Key;
  span: string;
  tone: string;
  extra?: ReactNode;
  inline?: boolean;
};

export function LandingFeatures() {
  const { t } = useI18n();
  const tiles: Tile[] = [
    { icon: CalendarPlus, title: "features.f1.title", body: "features.f1.body", tone: "bg-primary text-primary-foreground", span: "lg:col-span-3", extra: <MiniCalendar /> },
    { icon: Images, title: "features.f2.title", body: "features.f2.body", tone: "bg-azure text-white", span: "lg:col-span-3", extra: <MiniMedia /> },
    { icon: Heart, title: "features.f3.title", body: "features.f3.body", tone: "bg-amber text-[oklch(0.3_0.06_80)]", span: "lg:col-span-2", extra: <MiniReactions /> },
    { icon: ShieldCheck, title: "features.f5.title", body: "features.f5.body", tone: "bg-tang text-[oklch(0.3_0.07_45)]", span: "lg:col-span-2", extra: <MiniRoles /> },
    { icon: FileDown, title: "features.f4.title", body: "features.f4.body", tone: "bg-primary text-primary-foreground", span: "lg:col-span-2", extra: <MiniReport /> },
    { icon: Palette, title: "features.f6.title", body: "features.f6.body", tone: "bg-azure text-white", span: "lg:col-span-6", extra: <MiniColors />, inline: true },
  ];
  return (
    <section id="tinh-nang" className="scroll-mt-24 bg-[var(--azure-tint)] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
            {t("features.eyebrow")}
          </p>
          <h2 className="mt-3 text-balance font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            {t("features.title1")} <span className="text-primary">{nb(t("features.title2"))}</span>
          </h2>
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {tiles.map((f, i) => (
            <li
              key={f.title}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
              className={`spotlight surface surface-lift rounded-3xl p-6 ${f.span} ${f.inline ? "sm:col-span-2" : ""}`}
            >
              <div className={f.inline ? "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between" : "flex h-full flex-col"}>
                <div className="flex items-start gap-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${f.tone}`}>
                    <f.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{t(f.title)}</h3>
                    <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{t(f.body)}</p>
                  </div>
                </div>
                {f.inline ? f.extra : <div className="mt-auto pt-6">{f.extra}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
