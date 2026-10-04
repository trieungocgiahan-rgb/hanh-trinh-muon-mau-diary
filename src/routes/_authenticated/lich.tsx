import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useProject } from "@/hooks/use-project";
import { useActivities, type ActivityWithExtras } from "@/hooks/use-activities";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity/ActivityCard";
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{current.name}</h1>
          <p className="text-sm text-muted-foreground">Lịch hành trình của cả đội</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Tháng trước"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-32 text-center font-display text-lg font-semibold">
            {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Tháng sau"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>
            Hôm nay
          </Button>
        </div>
      </div>

      {/* legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-2xl border border-border/50 bg-gradient-to-r from-secondary/50 to-accent/30 px-4 py-2.5">
        {ACTIVITY_TYPES.map((t) => (
          <span key={t.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-full shadow-[inset_0_1px_0_oklch(1_0_0/0.4)]"
              style={{ backgroundColor: t.colorVar }}
            />
            {t.label}
          </span>
        ))}
      </div>

      {/* calendar grid */}
      <div className="surface overflow-hidden rounded-3xl">
        <div className="grid grid-cols-7 border-b bg-gradient-to-b from-secondary/60 to-secondary/20 text-center">
          {WEEKDAY_SHORT.map((w) => (
            <div key={w} className="py-2 text-xs font-semibold text-muted-foreground">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            if (!d)
              return <div key={i} className="min-h-20 border-b border-r bg-muted/20 sm:min-h-28" />;
            const key = ymd(d);
            const items = byDay.get(key) ?? [];
            const isToday = key === todayStr;
            return (
              <div
                key={i}
                className="group relative min-h-20 border-b border-r p-1 sm:min-h-28 sm:p-1.5"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-gradient-primary text-primary-foreground shadow-btn"
                        : "text-foreground"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openCreate(key)}
                      className="text-muted-foreground opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-70"
                      aria-label={`Thêm hoạt động ngày ${d.getDate()}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {items.slice(0, 3).map((a) => {
                    const tm = typeMeta(a.type);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => openDetail(a)}
                        className="bg-ombre block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium text-white transition-transform hover:-translate-y-px sm:text-xs"
                        style={{ "--c": tm.colorVar } as React.CSSProperties}
                        title={a.title}
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
              </div>
            );
          })}
        </div>
      </div>

      {/* upcoming / recent quick list */}
      {(activities ?? []).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-primary/30 bg-gradient-to-b from-card/70 to-secondary/40 py-12 text-center">
          <CalendarHeart className="mx-auto mb-3 h-10 w-10 text-primary/60" />
          <p className="font-display text-lg font-semibold">Chưa có hoạt động nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bắt đầu hành trình bằng cách ghi hoạt động đầu tiên!
          </p>
          {canEdit && (
            <Button variant="hero" className="mt-4" onClick={() => openCreate()}>
              <Plus className="h-4 w-4" /> Ghi hoạt động
            </Button>
          )}
        </div>
      ) : (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Gần đây</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(activities ?? []).slice(0, 6).map((a) => (
              <ActivityCard key={a.id} activity={a} onClick={() => openDetail(a)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
