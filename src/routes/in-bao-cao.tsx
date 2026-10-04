import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/use-project";
import { useActivities } from "@/hooks/use-activities";
import { useApplyTheme, useProjectBranding } from "@/hooks/use-project-branding";
import { ACTIVITY_TYPES, statusMeta, typeMeta } from "@/lib/activity-constants";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

type Search = { from?: string; to?: string; auto?: boolean };

export const Route = createFileRoute("/in-bao-cao")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Search => ({
    from: typeof s.from === "string" && s.from ? s.from : undefined,
    to: typeof s.to === "string" && s.to ? s.to : undefined,
    auto: s.auto === true || s.auto === 1 || s.auto === "1" ? true : undefined,
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
  },
  head: () => ({ meta: [{ title: `Báo cáo hành trình — ${BRAND}` }] }),
  component: PrintReport,
});

const MAX_PHOTOS = 4;

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function preload(urls: string[]): Promise<void> {
  const one = (u: string) =>
    new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = u;
    });
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 20000));
  return Promise.race([Promise.all(urls.map(one)).then(() => undefined), timeout]);
}

function PrintReport() {
  const { from, to, auto } = Route.useSearch();
  const { current, loading } = useProject();
  const { data: all, isLoading } = useActivities(current?.id);
  const branding = useProjectBranding(current?.id);
  useApplyTheme(branding.theme);

  // Báo cáo luôn in nền sáng, kể cả khi người dùng đang bật chế độ tối
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  const activities = useMemo(
    () =>
      (all ?? [])
        .filter((a) => (!from || a.date >= from) && (!to || a.date <= to))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [all, from, to],
  );

  const photoPaths = useMemo(() => {
    const m = new Map<string, string[]>();
    activities.forEach((a) =>
      m.set(
        a.id,
        a.attachments
          .filter((x) => x.kind === "photo" && x.storage_path)
          .slice(0, MAX_PHOTOS)
          .map((x) => x.storage_path!),
      ),
    );
    return m;
  }, [activities]);

  const [urls, setUrls] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const printed = useRef(false);

  useEffect(() => {
    if (isLoading || loading || !current) return;
    let active = true;
    (async () => {
      const paths = Array.from(
        new Set([
          ...(branding.coverPath ? [branding.coverPath] : []),
          ...[...photoPaths.values()].flat(),
        ]),
      );
      const map: Record<string, string> = {};
      if (paths.length) {
        const { data } = await supabase.storage.from("media").createSignedUrls(paths, 3600);
        (data ?? []).forEach((d) => {
          if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
        });
      }
      if (!active) return;
      setUrls(map);
      await preload(Object.values(map));
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [isLoading, loading, current, photoPaths, branding.coverPath]);

  useEffect(() => {
    if (ready && auto && !printed.current) {
      printed.current = true;
      setTimeout(() => window.print(), 400);
    }
  }, [ready, auto]);

  if (loading || isLoading || !current) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const participants = activities.reduce((s, a) => s + (a.participant_count ?? 0), 0);
  const completed = activities.filter((a) => a.status === "completed").length;
  const workshops = activities.filter((a) => a.type === "workshop").length;
  const photos = activities.reduce(
    (s, a) => s + a.attachments.filter((x) => x.kind === "photo").length,
    0,
  );
  const byType = ACTIVITY_TYPES.map((t) => ({
    ...t,
    count: activities.filter((a) => a.type === t.value).length,
  })).filter((t) => t.count > 0);
  const maxType = Math.max(1, ...byType.map((t) => t.count));
  const quotes = [...activities]
    .filter((a) => a.highlight)
    .reverse()
    .slice(0, 3);
  const period =
    from || to
      ? `${from ? fmt(from) : "…"} – ${to ? fmt(to) : "…"}`
      : activities.length
        ? `${fmt(activities[0].date)} – ${fmt(activities[activities.length - 1].date)}`
        : "Toàn bộ hành trình";
  const coverUrl = branding.coverPath ? urls[branding.coverPath] : undefined;

  return (
    <div className="min-h-screen bg-muted/40 pb-16 print:bg-white print:pb-0">
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          html, body { background: #fff !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .avoid-break { break-inside: avoid; }
          .doc { box-shadow: none !important; margin: 0 !important; max-width: none !important; padding: 0 !important; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[210mm] items-center justify-between gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/bao-cao">
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">
              Trong hộp thoại in, chọn “Lưu dưới dạng PDF”.
            </span>
            <Button variant="hero" size="sm" disabled={!ready} onClick={() => window.print()}>
              {ready ? (
                <Printer className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {ready ? "In / Lưu PDF" : "Đang tải ảnh…"}
            </Button>
          </div>
        </div>
      </div>

      <div className="doc mx-auto mt-6 max-w-[210mm] space-y-8 rounded-2xl bg-white p-6 text-[oklch(0.28_0.04_30)] shadow-pop sm:p-10">
        {/* Trang bìa */}
        <header className="avoid-break overflow-hidden rounded-2xl">
          {coverUrl && <img src={coverUrl} alt="" className="h-[62mm] w-full object-cover" />}
          <div className="bg-gradient-hero px-8 py-9 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">
              Báo cáo hành trình{current.org_name ? ` · ${current.org_name}` : ""}
            </p>
            <h1 className="mt-2 text-balance font-display text-4xl font-semibold leading-tight">
              {current.name}
            </h1>
            {current.description && (
              <p className="mt-2 max-w-xl text-sm text-white/90">{current.description}</p>
            )}
            <p className="mt-5 text-sm text-white/90">
              {period} · Xuất ngày {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
        </header>

        {/* Số liệu */}
        <section className="avoid-break">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [activities.length, "hoạt động"],
              [participants, "lượt tham gia"],
              [completed, "đã hoàn thành"],
              [photos, "ảnh lưu lại"],
            ].map(([v, l]) => (
              <div key={l as string} className="rounded-xl border border-black/10 p-4 text-center">
                <p className="text-gradient font-display text-4xl font-semibold tabular-nums">
                  {v}
                </p>
                <p className="mt-1 text-xs text-black/60">{l}</p>
              </div>
            ))}
          </div>
          {byType.length > 0 && (
            <div className="mt-5 space-y-2">
              {byType.map((t) => (
                <div key={t.value} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 text-black/70">{t.label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(t.count / maxType) * 100}%`,
                        backgroundColor: t.colorVar,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right font-semibold tabular-nums">{t.count}</span>
                </div>
              ))}
              {workshops > 0 && (
                <p className="pt-1 text-xs text-black/50">Trong đó {workshops} workshop.</p>
              )}
            </div>
          )}
        </section>

        {/* Khoảnh khắc nổi bật */}
        {quotes.length > 0 && (
          <section className="avoid-break">
            <h2 className="font-display text-2xl font-semibold">Khoảnh khắc nổi bật</h2>
            <div className="mt-3 space-y-3">
              {quotes.map((a) => (
                <blockquote
                  key={a.id}
                  className="border-l-4 bg-black/[0.03] py-3 pl-5 pr-4"
                  style={{ borderColor: typeMeta(a.type).colorVar }}
                >
                  <p className="font-display text-lg italic leading-snug">“{a.highlight}”</p>
                  <footer className="mt-1 text-xs text-black/55">
                    {a.title} · {fmt(a.date)}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Chi tiết */}
        <section>
          <h2 className="font-display text-2xl font-semibold">Chi tiết hoạt động</h2>
          {activities.length === 0 && (
            <p className="mt-3 text-sm text-black/60">
              Không có hoạt động nào trong khoảng thời gian này.
            </p>
          )}
          <div className="mt-4 space-y-6">
            {activities.map((a) => {
              const tm = typeMeta(a.type);
              const sm = statusMeta(a.status);
              const pics = (photoPaths.get(a.id) ?? []).map((p) => urls[p]).filter(Boolean);
              return (
                <article key={a.id} className="avoid-break rounded-xl border border-black/10 p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="font-semibold text-black/70">{fmt(a.date)}</span>
                    <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-black/55">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: tm.colorVar }}
                      />
                      {tm.label}
                    </span>
                    <span className="rounded-full border border-black/15 px-2 py-0.5 text-[10px] font-semibold text-black/60">
                      {sm.label}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug">
                    {a.title}
                  </h3>
                  <p className="mt-1 text-xs text-black/55">
                    {[
                      a.location,
                      a.participant_count != null ? `${a.participant_count} người tham gia` : null,
                      a.author_name ? `Ghi bởi ${a.author_name}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {a.highlight && (
                    <p className="mt-3 font-display text-base italic text-black/75">
                      “{a.highlight}”
                    </p>
                  )}
                  {[
                    ["Diễn biến chính", a.summary],
                    ["Vấn đề phát sinh", a.issues],
                    ["Bước tiếp theo", a.next_steps],
                  ].map(
                    ([label, text]) =>
                      text && (
                        <div key={label} className="mt-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-black/45">
                            {label}
                          </p>
                          <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">
                            {text}
                          </p>
                        </div>
                      ),
                  )}
                  {pics.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {pics.map((u, i) => (
                        <img
                          key={i}
                          src={u}
                          alt=""
                          className="h-[42mm] w-full rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-black/10 pt-4 text-center text-xs text-black/45">
          Xuất từ {BRAND} · {new Date().toLocaleDateString("vi-VN")}
        </footer>
      </div>
    </div>
  );
}
