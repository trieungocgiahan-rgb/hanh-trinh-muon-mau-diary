import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Mic, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import group from "@/assets/landing-group.jpg";
import { useI18n } from "@/lib/i18n";

const WEEKDAY_KEYS = [
  "weekday.1",
  "weekday.2",
  "weekday.3",
  "weekday.4",
  "weekday.5",
  "weekday.6",
  "weekday.7",
] as const;

// Lịch tháng mẫu: [ngày, màu loại hoạt động | null]
const DAYS: { d: number; chips: string[] }[] = Array.from({ length: 35 }, (_, i) => {
  const d = i - 2; // tháng 10/2026 bắt đầu từ thứ 5
  const chips: Record<number, string[]> = {
    3: ["bg-type-workshop"],
    8: ["bg-type-team"],
    11: ["bg-type-site", "bg-type-event"],
    15: ["bg-type-workshop"],
    18: ["bg-type-partner"],
    22: ["bg-type-site"],
    25: ["bg-type-workshop", "bg-type-team"],
  };
  return { d, chips: chips[d] ?? [] };
});

function CalendarPreview() {
  const { t } = useI18n();
  return (
    <div className="surface rounded-2xl p-4 shadow-pop sm:p-5">
      <div className="flex items-center justify-between pb-3">
        <p className="font-display text-lg font-semibold">{t("hero.mockMonth")}</p>
        <div className="flex items-center gap-1 text-muted-foreground" aria-hidden>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card">
            <ChevronLeft className="h-3.5 w-3.5" />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card">
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {WEEKDAY_KEYS.map((w) => (
          <div
            key={w}
            className="bg-secondary/60 py-1.5 text-center text-[10px] font-semibold text-muted-foreground"
          >
            {t(w)}
          </div>
        ))}
        {DAYS.map(({ d, chips }, i) => {
          const inMonth = d >= 1 && d <= 31;
          return (
            <div key={i} className="min-h-12 bg-card p-1.5 sm:min-h-14">
              {inMonth && (
                <>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                      d === 4 ? "bg-gradient-primary text-primary-foreground" : "text-foreground/70"
                    }`}
                  >
                    {d}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {chips.map((c, k) => (
                      <span key={k} className={`block h-1.5 rounded-full ${c}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LandingHero() {
  const { t } = useI18n();
  return (
    <section className="grain relative overflow-hidden bg-mesh-warm pb-20 pt-12 sm:pb-28 sm:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("brand.taglineLong")}
          </p>
          <h1 className="mt-5 font-display text-[2.75rem] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
            {t("hero.l1")}
            <br />
            <em className="text-gradient pr-1 font-medium">{t("hero.l2")}</em>
            {t("hero.l3") && (
              <>
                <br />
                {t("hero.l3")}
              </>
            )}
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
            {t("hero.sub")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
              <Link to="/auth">
                {t("common.enterJournal")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href="#dung-thu">{t("hero.tryNow")}</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t("hero.signInNote")}</p>
        </div>

        <div className="relative pb-16 lg:pb-10">
          <CalendarPreview />

          {/* thẻ hoạt động nổi */}
          <div className="surface absolute -bottom-4 left-0 w-[88%] overflow-hidden rounded-xl shadow-pop sm:-bottom-10 sm:-left-8 sm:w-80">
            <img
              src={group}
              alt={t("hero.photoAlt")}
              width={1200}
              height={912}
              className="h-20 w-full object-cover"
            />
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="h-9 w-1.5 shrink-0 rounded-full bg-type-workshop" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t("hero.mockActivity")}</p>
                <p className="truncate text-xs text-muted-foreground">{t("hero.mockMeta")}</p>
              </div>
              <span className="shrink-0 rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-mint-foreground">
                {t("status.completed")}
              </span>
            </div>
          </div>

          {/* ghi âm */}
          <div className="surface absolute -right-1 top-[44%] hidden w-52 items-center gap-3 rounded-xl px-3 py-2.5 shadow-pop sm:flex lg:-right-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-grape text-grape-foreground shadow-btn">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
            <div className="flex flex-1 items-center gap-[3px]" aria-hidden>
              {[6, 12, 8, 16, 10, 18, 7, 13, 9, 15, 6, 11].map((h, i) => (
                <span key={i} className="w-[3px] rounded-full bg-grape/70" style={{ height: h }} />
              ))}
            </div>
            <Mic className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
