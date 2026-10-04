import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useProject } from "@/hooks/use-project";
import { useActivities } from "@/hooks/use-activities";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ACTIVITY_TYPES,
  ACTIVITY_STATUSES,
  MONTH_NAMES,
  type ActivityType,
  type ActivityStatus,
} from "@/lib/activity-constants";
import { Search, Loader2, ListChecks } from "lucide-react";

export const Route = createFileRoute("/_authenticated/danh-sach")({
  head: () => ({ meta: [{ title: "Danh sách hoạt động — Nhật Ký Hành Trình" }] }),
  component: ListPage,
});

function ListPage() {
  const { current } = useProject();
  const { data: activities, isLoading } = useActivities(current?.id);
  const { openDetail } = useActivityDialog();
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
        (a.highlight ?? "").toLowerCase().includes(term)
      );
    });
  }, [activities, q, typeFilter, statusFilter]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((a) => {
      const d = new Date(a.date + "T00:00:00");
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      const arr = map.get(label) ?? [];
      arr.push(a);
      map.set(label, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Danh sách &amp; dòng thời gian</h1>
        <p className="text-sm text-muted-foreground">Tìm kiếm và lọc toàn bộ hoạt động</p>
      </div>

      <div className="space-y-3 surface rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên, địa điểm, hoặc quote…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("all")}
          >
            Tất cả loại
          </Button>
          {ACTIVITY_TYPES.map((t) => (
            <Button
              key={t.value}
              variant={typeFilter === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(t.value)}
            >
              {t.emoji} {t.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "all" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Mọi trạng thái
          </Button>
          {ACTIVITY_STATUSES.map((s) => (
            <Button
              key={s.value}
              variant={statusFilter === s.value ? "secondary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-primary/30 bg-gradient-to-b from-card/70 to-secondary/40 py-12 text-center">
          <ListChecks className="mx-auto mb-3 h-10 w-10 text-primary/60" />
          <p className="font-display text-lg font-semibold">Không có kết quả</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Thử đổi từ khóa hoặc bộ lọc khác nhé.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([label, items]) => (
            <div key={label}>
              <h2 className="mb-3 font-display text-base font-semibold text-muted-foreground">
                {label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((a) => (
                  <ActivityCard key={a.id} activity={a} onClick={() => openDetail(a)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
