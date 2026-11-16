import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, Plus, Search, X } from "lucide-react";
import { FeedPost, FeedSkeleton } from "@/components/feed/FeedPost";
import { TypeDot } from "@/components/activity/TypeDot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActivities } from "@/hooks/use-activities";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import { useProject } from "@/hooks/use-project";
import {
  ACTIVITY_STATUSES,
  ACTIVITY_TYPES,
  MONTH_KEYS,
  typeMeta,
  type ActivityStatus,
  type ActivityType,
} from "@/lib/activity-constants";
import { BRAND } from "@/lib/brand";
import { tNow, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/danh-sach")({
  head: () => ({ meta: [{ title: `${tNow("list.pageTitle")} — ${BRAND}` }] }),
  component: JournalPage,
});

function JournalPage() {
  const { t, locale } = useI18n();
  const { current, canEdit } = useProject();
  const { data: activities, isLoading } = useActivities(current?.id);
  const { openDetail, openCreate } = useActivityDialog();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "all">("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (activities ?? []).filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!term) return true;
      return (
        a.title.toLowerCase().includes(term) ||
        (a.location ?? "").toLowerCase().includes(term) ||
        (a.highlight ?? "").toLowerCase().includes(term) ||
        (a.summary ?? "").toLowerCase().includes(term)
      );
    });
  }, [activities, q, typeFilter, statusFilter]);

  // chia theo tháng để dễ định hướng khi cuộn
  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((a) => {
      const d = new Date(a.date + "T00:00:00");
      const label = `${t(MONTH_KEYS[d.getMonth()])} ${d.getFullYear()}`;
      const arr = map.get(label) ?? [];
      arr.push(a);
      map.set(label, arr);
    });
    return Array.from(map.entries());
  }, [filtered, t]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (activities ?? [])
      .filter((a) => a.date >= today && a.status !== "completed")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [activities]);

  const monthStats = useMemo(() => {
    const prefix = new Date().toISOString().slice(0, 7);
    const list = (activities ?? []).filter((a) => a.date.startsWith(prefix));
    return {
      entries: list.length,
      people: list.reduce((n, a) => n + (a.participant_count ?? 0), 0),
      photos: list.reduce((n, a) => n + a.attachments.filter((x) => x.kind === "photo").length, 0),
    };
  }, [activities]);

  const hasFilter = q.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";

  return (
    <div className="mx-auto grid max-w-5xl gap-10 xl:grid-cols-[minmax(0,40rem)_18rem] xl:justify-center">
      <div className="min-w-0">
        {/* thanh lọc dính phía trên, kiểu Notion */}
        <div className="sticky top-0 z-20 -mx-4 space-y-3 border-b border-border bg-background/90 px-4 pb-3 pt-3 backdrop-blur lg:top-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("list.search")}
                className="h-10 rounded-xl border-transparent bg-muted pl-9 focus-visible:bg-card"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ActivityStatus | "all")}>
              <SelectTrigger className="h-10 w-[9.5rem] rounded-xl border-transparent bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("list.allStatuses")}</SelectItem>
                {ACTIVITY_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {t(s.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {([{ value: "all" as const }, ...ACTIVITY_TYPES] as const).map((ty) => {
              const on = typeFilter === ty.value;
              return (
                <button
                  key={ty.value}
                  type="button"
                  onClick={() => setTypeFilter(ty.value)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    on
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {ty.value !== "all" && <TypeDot color={typeMeta(ty.value).colorVar} />}
                  {ty.value === "all" ? t("list.allTypes") : t(typeMeta(ty.value).labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {isLoading ? (
            <FeedSkeleton />
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                {hasFilter ? <Search className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </span>
              <p className="mt-4 font-display text-lg font-bold">
                {hasFilter ? t("list.noResults") : t("feed.emptyTitle")}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                {hasFilter ? t("list.noResultsHint") : t("feed.emptyBody")}
              </p>
              {hasFilter ? (
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setQ("");
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  <X className="h-4 w-4" /> {t("feed.clearFilters")}
                </Button>
              ) : (
                canEdit && (
                  <Button className="mt-5" onClick={() => openCreate()}>
                    <Plus className="h-4 w-4" /> {t("feed.addFirst")}
                  </Button>
                )
              )}
            </div>
          ) : (
            groups.map(([label, items]) => (
              <section key={label} className="space-y-5">
                <h2 className="pt-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {label}
                </h2>
                {items.map((a) => (
                  <FeedPost key={a.id} activity={a} projectId={current!.id} onOpen={() => openDetail(a)} />
                ))}
              </section>
            ))
          )}
        </div>
      </div>

      {/* cột phụ, chỉ hiện trên màn rộng */}
      <aside className="hidden space-y-5 pt-3 xl:block">
        <div className="sticky top-3 space-y-5">
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("feed.thisMonth")}
            </h2>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                [monthStats.entries, t("feed.entries")],
                [monthStats.people, t("feed.peopleLabel")],
                [monthStats.photos, t("feed.photos")],
              ].map(([n, label]) => (
                <div key={String(label)} className="rounded-xl bg-muted py-2.5">
                  <dd className="font-display text-xl font-extrabold tabular-nums">{n}</dd>
                  <dt className="text-[11px] text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" /> {t("feed.upcoming")}
            </h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("feed.noUpcoming")}</p>
            ) : (
              <ul className="mt-2 divide-y divide-border">
                {upcoming.map((a) => {
                  const d = new Date(a.date + "T00:00:00");
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => openDetail(a)}
                        className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:text-primary-ink"
                      >
                        <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          <span className="text-sm font-extrabold leading-none">{d.getDate()}</span>
                          <span className="text-[9px] font-bold uppercase">
                            {new Intl.DateTimeFormat(locale, { month: "short" }).format(d)}
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{a.title}</span>
                          {a.location && (
                            <span className="block truncate text-xs text-muted-foreground">{a.location}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
