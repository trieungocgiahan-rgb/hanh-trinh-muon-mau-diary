import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useProject } from "@/hooks/use-project";
import { useActivities, type ActivityWithExtras } from "@/hooks/use-activities";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { PageHeader } from "@/components/PageHeader";
import { TypeDot } from "@/components/activity/TypeDot";
import { ACTIVITY_TYPES, MONTH_NAMES, WEEKDAY_SHORT, typeMeta } from "@/lib/activity-constants";
import { ChevronLeft, ChevronRight, Plus, Loader2, CalendarHeart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/lich")({
  head: () => ({ meta: [{ title: "Lịch hoạt động — Nhật Ký Hành Trình" }] }),
  component: CalendarPage,
});

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function CalendarPage() {
  const { current, canEdit, loading: pLoading } = useProject();
  const { data: activities, isLoading } = useActivities(current?.id);
  const { openCreate, openDetail } = useActivityDialog();
  const [cursor, setCursor] = useState(() => new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, ActivityWithExtras[]>();
    (activities ?? []).forEach((a) => {
      const arr = map.get(a.date) ?? [];
      arr.push(a);
      map.set(a.date, arr);
    });
    return map;
  }, [activities]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, month, d));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const todayStr = ymd(new Date());

  if (pLoading || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-muted-foreground">
          Bạn chưa thuộc dự án nào. Hãy liên hệ quản trị viên để được mời.
        </p>
      </div>
    );
  }

  const monthPrefix = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
  const monthItems = (activities ?? []).filter((a) => a.date.startsWith(monthPrefix));
  const monthPeople = monthItems.reduce((n, a) => n + (a.participant_count ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={current.org_name || "Lịch hành trình"}
        title={current.name}
        description={`${monthItems.length} hoạt động trong ${MONTH_NAMES[cursor.getMonth()].toLowerCase()}${
          monthPeople ? ` · ${monthPeople} lượt tham gia` : ""
        }`}
        actions={
          <div className="surface flex items-center gap-1 rounded-full p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Tháng trước"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-28 text-center font-display text-base font-semibold">
              {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Tháng sau"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setCursor(new Date())}>
              Hôm nay
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
          {ACTIVITY_TYPES.map((t) => (
            <li key={t.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TypeDot color={t.colorVar} />
              {t.label}
            </li>
          ))}
        </ul>

        <div className="surface overflow-hidden rounded-2xl">
          <div className="grid grid-cols-7 border-b border-border/70 bg-secondary/40 text-center">
            {WEEKDAY_SHORT.map((w, i) => (
              <div
                key={w}
                className={`py-2.5 text-[11px] font-semibold uppercase tracking-wider ${
                  i >= 5 ? "text-primary/80" : "text-muted-foreground"
                }`}
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const weekend = i % 7 >= 5;
              if (!d)
                return (
                  <div
                    key={i}
                    className="min-h-16 border-b border-r border-border/50 bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,oklch(0.92_0.02_60/0.35)_6px,oklch(0.92_0.02_60/0.35)_7px)] sm:min-h-28"
                  />
                );
              const key = ymd(d);
              const items = byDay.get(key) ?? [];
              const isToday = key === todayStr;
              return (
                <div
                  key={i}
                  className={`group relative min-h-16 border-b border-r border-border/50 p-1 sm:min-h-28 sm:p-1.5 ${
                    isToday ? "bg-primary/[0.06]" : weekend ? "bg-secondary/25" : ""
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                        isToday
                          ? "bg-gradient-primary text-primary-foreground shadow-btn"
                          : "text-foreground/80"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => openCreate(key)}
                        className="hidden h-5 w-5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-primary/10 hover:text-primary focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
                        aria-label={`Thêm hoạt động ngày ${d.getDate()}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* desktop: thanh sự kiện; mobile: chấm màu */}
                  <div className="hidden space-y-1 sm:block">
                    {items.slice(0, 3).map((a) => {
                      const tm = typeMeta(a.type);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => openDetail(a)}
                          title={a.title}
                          className="block w-full truncate rounded-[5px] py-0.5 pl-2 pr-1 text-left text-xs font-medium text-foreground transition-colors hover:brightness-95"
                          style={{
                            boxShadow: `inset 3px 0 0 ${tm.colorVar}`,
                            backgroundColor: `color-mix(in oklab, ${tm.colorVar} 14%, white)`,
                          }}
                        >
                          {a.title}
                        </button>
                      );
                    })}
                    {items.length > 3 && (
                      <span className="px-1 text-[10px] text-muted-foreground">
                        +{items.length - 3} nữa
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 sm:hidden">
                    {items.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => openDetail(a)}
                        aria-label={a.title}
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: typeMeta(a.type).colorVar }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(activities ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-b from-card/70 to-secondary/40 py-14 text-center">
          <CalendarHeart className="mx-auto mb-3 h-10 w-10 text-primary/60" />
          <p className="font-display text-xl font-semibold">Chưa có hoạt động nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bắt đầu hành trình bằng cách ghi hoạt động đầu tiên!
          </p>
          {canEdit && (
            <Button variant="hero" className="mt-5" onClick={() => openCreate()}>
              <Plus className="h-4 w-4" /> Ghi hoạt động
            </Button>
          )}
        </div>
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold">Gần đây</h2>
            <Link
              to="/danh-sach"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(activities ?? []).slice(0, 6).map((a) => (
              <ActivityCard key={a.id} activity={a} onClick={() => openDetail(a)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
