import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { TypeDot } from "@/components/activity/TypeDot";
import { useEffect, useMemo, useState } from "react";
import { useCountUp } from "@/hooks/use-count-up";
import { useProject } from "@/hooks/use-project";
import { useActivities } from "@/hooks/use-activities";
import { ACTIVITY_TYPES, ACTIVITY_STATUSES, typeMeta } from "@/lib/activity-constants";
import { CalendarRange, Sparkles, Users, CheckCircle2, Loader2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useI18n, tNow } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/thong-ke")({
  head: () => ({ meta: [{ title: `${tNow("stats.pageTitle")} — ${BRAND}` }] }),
  component: StatsPage,
});

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  const shown = useCountUp(typeof value === "number" ? value : 0);
  return (
    <div className="surface rounded-xl p-5">
      <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="font-display text-3xl font-bold tabular-nums">
        {typeof value === "number" ? shown : value}
      </div>
      <div className="mt-0.5 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function StatsPage() {
  const { t } = useI18n();
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
        eyebrow={t("stats.eyebrow")}
        title={t("stats.pageTitle")}
        description={t("stats.desc", { name: current?.name ?? t("stats.projectFallback") })}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={CalendarRange}
          label={t("stats.total")}
          value={stats.total}
        />
        <StatCard
          icon={Sparkles}
          label={t("type.workshop")}
          value={stats.workshops}
        />
        <StatCard
          icon={Users}
          label={t("stats.participants")}
          value={stats.participants}
        />
        <StatCard
          icon={CheckCircle2}
          label={t("stats.completed")}
          value={stats.completed}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface rounded-2xl p-5">
          <h2 className="mb-4 font-display text-xl font-semibold">{t("stats.byType")}</h2>
          <div className="space-y-3">
            {stats.byType.map((ty) => (
              <div key={ty.value}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <TypeDot color={ty.colorVar} />
                    {t(ty.labelKey)}
                  </span>
                  <span className="font-semibold">{ty.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: grown ? `${(ty.count / maxType) * 100}%` : "0%",
                      backgroundColor: ty.colorVar,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface rounded-2xl p-5">
          <h2 className="mb-4 font-display text-xl font-semibold">{t("stats.byStatus")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.byStatus.map((s) => (
              <div key={s.value} className={`rounded-2xl p-4 ${s.className}`}>
                <div className="font-display text-2xl font-bold">{s.count}</div>
                <div className="text-sm">{t(s.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface rounded-2xl p-5">
        <h2 className="mb-3 font-display text-xl font-semibold">{t("stats.distribution")}</h2>
        <div className="flex h-6 overflow-hidden rounded-full">
          {stats.byType
            .filter((ty) => ty.count > 0)
            .map((ty) => (
              <div
                key={ty.value}
                style={{ flex: ty.count, backgroundColor: ty.colorVar }}
                title={`${t(ty.labelKey)}: ${ty.count}`}
              />
            ))}
          {stats.total === 0 && <div className="flex-1 bg-muted" />}
        </div>
      </div>
    </div>
  );
}
