import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { TypeDot } from "@/components/activity/TypeDot";
import { useEffect, useMemo, useState } from "react";
import { useCountUp } from "@/hooks/use-count-up";
import { useProject } from "@/hooks/use-project";
import { useActivities } from "@/hooks/use-activities";
import { ACTIVITY_TYPES, ACTIVITY_STATUSES, typeMeta } from "@/lib/activity-constants";
import { CalendarRange, Sparkles, Users, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/thong-ke")({
  head: () => ({ meta: [{ title: "Thống kê — Nhật Ký Hành Trình" }] }),
  component: StatsPage,
});

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  tone = "text-primary-foreground",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  gradient: string;
  tone?: string;
}) {
  const shown = useCountUp(typeof value === "number" ? value : 0);
  return (
    <div
      className={`grain relative overflow-hidden rounded-2xl p-5 shadow-pop dark:saturate-75 ${tone} ${gradient}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/25 blur-2xl"
      />
      <Icon className="relative mb-3 h-7 w-7 opacity-90" />
      <div className="relative font-display text-4xl font-semibold tabular-nums">
        {typeof value === "number" ? shown : value}
      </div>
      <div className="relative text-sm opacity-90">{label}</div>
    </div>
  );
}

function StatsPage() {
  const { current } = useProject();
  const { data: activities, isLoading } = useActivities(current?.id);
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (isLoading) return;
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, [isLoading]);

  const stats = useMemo(() => {
    const list = activities ?? [];
    const total = list.length;
    const workshops = list.filter((a) => a.type === "workshop").length;
    const participants = list.reduce((s, a) => s + (a.participant_count ?? 0), 0);
    const completed = list.filter((a) => a.status === "completed").length;
    const byType = ACTIVITY_TYPES.map((t) => ({
      ...t,
      count: list.filter((a) => a.type === t.value).length,
    }));
    const byStatus = ACTIVITY_STATUSES.map((s) => ({
      ...s,
      count: list.filter((a) => a.status === s.value).length,
    }));
    return { total, workshops, participants, completed, byType, byStatus };
  }, [activities]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const maxType = Math.max(1, ...stats.byType.map((t) => t.count));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tổng quan"
        title="Thống kê"
        description={`Hành trình của ${current?.name ?? "dự án"} qua các con số`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={CalendarRange}
          label="Tổng hoạt động"
          value={stats.total}
          gradient="bg-gradient-hero"
        />
        <StatCard
          icon={Sparkles}
          label="Workshop"
          value={stats.workshops}
          gradient="bg-gradient-sun"
          tone="text-sunny-foreground"
        />
        <StatCard
          icon={Users}
          label="Lượt tham gia"
          value={stats.participants}
          gradient="bg-gradient-grape"
        />
        <StatCard
          icon={CheckCircle2}
          label="Đã hoàn thành"
          value={stats.completed}
          gradient="bg-gradient-mint"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface rounded-2xl p-5">
          <h2 className="mb-4 font-display text-xl font-semibold">Theo loại hoạt động</h2>
          <div className="space-y-3">
            {stats.byType.map((t) => (
              <div key={t.value}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <TypeDot color={t.colorVar} />
                    {t.label}
                  </span>
                  <span className="font-semibold">{t.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: grown ? `${(t.count / maxType) * 100}%` : "0%",
                      backgroundColor: t.colorVar,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface rounded-2xl p-5">
          <h2 className="mb-4 font-display text-xl font-semibold">Theo trạng thái</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.byStatus.map((s) => (
              <div key={s.value} className={`rounded-2xl p-4 ${s.className}`}>
                <div className="font-display text-2xl font-bold">{s.count}</div>
                <div className="text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface rounded-2xl p-5">
        <h2 className="mb-3 font-display text-xl font-semibold">Phân bố nhanh</h2>
        <div className="flex h-6 overflow-hidden rounded-full">
          {stats.byType
            .filter((t) => t.count > 0)
            .map((t) => (
              <div
                key={t.value}
                style={{ flex: t.count, backgroundColor: t.colorVar }}
                title={`${t.label}: ${t.count}`}
              />
            ))}
          {stats.total === 0 && <div className="flex-1 bg-muted" />}
        </div>
      </div>
    </div>
  );
}
