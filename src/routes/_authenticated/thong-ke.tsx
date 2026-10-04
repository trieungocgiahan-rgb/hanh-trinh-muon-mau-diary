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
          gradient="bg-gradient-hero"
        />
        <StatCard
          icon={Sparkles}
          label={t("type.workshop")}
          value={stats.workshops}
          gradient="bg-gradient-sun"
          tone="text-sunny-foreground"
        />
        <StatCard
          icon={Users}
          label={t("stats.participants")}
          value={stats.participants}
          gradient="bg-gradient-grape"
        />
        <StatCard
          icon={CheckCircle2}
          label={t("stats.completed")}
          value={stats.completed}
          gradient="bg-gradient-mint"
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
