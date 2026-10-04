import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  FileDown,
  Heart,
  ImageIcon,
  ImagePlus,
  Lock,
  MessageCircle,
  Mic,
  Pause,
  Play,
  Plus,
  Send,
  Square,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACTIVITY_TYPES, MONTH_NAMES, WEEKDAY_SHORT, typeMeta } from "@/lib/activity-constants";
import type { ActivityType } from "@/lib/activity-constants";
import { PROJECT_THEMES, applyThemeVars, clearThemeVars } from "@/lib/project-themes";
import { TypeDot } from "@/components/activity/TypeDot";
import {
  DEMO_TABS,
  ME,
  PERMISSIONS,
  ROLE_META,
  SAMPLE_PHOTOS,
  SEED_ACTIVITIES,
  type DemoActivity,
  type DemoTab,
  type Role,
} from "@/components/landing/demo/demo-data";
import group from "@/assets/landing-group.jpg";

type Update = (id: string, fn: (a: DemoActivity) => DemoActivity) => void;

/* ---------- phần dùng chung ---------- */

function ViewerNote({ canWrite }: { canWrite: boolean }) {
  if (canWrite) return null;
  return (
    <p className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
      <Lock className="h-3.5 w-3.5 shrink-0" />
      Bạn đang là “Người xem” nên chỉ xem được. Qua tab Phân quyền để đổi vai trò.
    </p>
  );
}

function ActivityPicker({
  acts,
  selectedId,
  onSelect,
}: {
  acts: DemoActivity[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {acts.map((a) => {
        const on = a.id === selectedId;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            aria-pressed={on}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              on
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            <TypeDot color={typeMeta(a.type).colorVar} />
            <span className="max-w-[10rem] truncate">{a.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function SelectedSummary({ a, month }: { a: DemoActivity; month: string }) {
  const tm = typeMeta(a.type);
  return (
    <div className="surface flex items-start gap-3 rounded-xl p-3.5">
      <div
        className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-lg"
        style={{
          backgroundColor: `color-mix(in oklab, ${tm.colorVar} 14%, var(--card))`,
          color: `color-mix(in oklab, ${tm.colorVar} 70%, var(--foreground))`,
        }}
      >
        <span className="font-display text-lg font-semibold leading-none">{a.day}</span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase">{month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <TypeDot color={tm.colorVar} />
          {tm.label}
        </p>
        <p className="mt-0.5 font-display text-base font-semibold leading-snug">{a.title}</p>
        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{a.participants} người</span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {a.likes.length}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {a.comments.length}
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {a.photos.length}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ---------- 1. Lịch ---------- */

function CalendarPanel({
  now,
  acts,
  selectedId,
  select,
  add,
  canWrite,
}: {
  now: Date;
  acts: DemoActivity[];
  selectedId: string;
  select: (id: string) => void;
  add: (day: number, title: string, type: ActivityType) => void;
  canWrite: boolean;
}) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: dim }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const [draftDay, setDraftDay] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ActivityType>("workshop");
  const [blocked, setBlocked] = useState(false);
  const selected = acts.find((a) => a.id === selectedId) ?? acts[0];

  function submit() {
    if (draftDay == null || !title.trim()) return;
    add(draftDay, title.trim(), type);
    setDraftDay(null);
    setTitle("");
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="flex items-center justify-between bg-secondary/40 px-3 py-2">
          <p className="font-display text-base font-semibold">
            {MONTH_NAMES[m]} {y}
          </p>
          <ul className="hidden gap-3 sm:flex">
            {ACTIVITY_TYPES.slice(0, 4).map((t) => (
              <li
                key={t.value}
                className="flex items-center gap-1 text-[10px] text-muted-foreground"
              >
                <TypeDot color={t.colorVar} />
                {t.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-7 gap-px bg-border">
          {WEEKDAY_SHORT.map((w) => (
            <div
              key={w}
              className="bg-card py-1.5 text-center text-[10px] font-semibold uppercase text-muted-foreground"
            >
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="min-h-12 bg-card/60 sm:min-h-16" />;
            const items = acts.filter((a) => a.day === d);
            const isToday = d === now.getDate();
            const isDraft = d === draftDay;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (items.length === 1) select(items[0].id);
                  if (items.length) return;
                  if (!canWrite) {
                    setBlocked(true);
                    return;
                  }
                  setBlocked(false);
                  setDraftDay(d);
                }}
                aria-label={`Ngày ${d}`}
                className={`group relative min-h-12 bg-card p-1 text-left transition-colors hover:bg-primary/5 sm:min-h-16 sm:p-1.5 ${
                  isDraft ? "bg-primary/10 ring-2 ring-inset ring-primary" : ""
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${
                    isToday ? "bg-gradient-primary text-primary-foreground" : "text-foreground/70"
                  }`}
                >
                  {d}
                </span>
                {items.length === 0 && canWrite && (
                  <Plus className="absolute right-1 top-1 h-3 w-3 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                )}
                <div className="mt-0.5 space-y-0.5">
                  {items.map((a) => {
                    const tm = typeMeta(a.type);
                    const on = a.id === selectedId;
                    return (
                      <span
                        key={a.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          select(a.id);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && select(a.id)}
                        className={`block h-1.5 rounded-full sm:h-auto sm:truncate sm:rounded-[4px] sm:py-0.5 sm:pl-1.5 sm:pr-1 sm:text-[10px] sm:font-medium sm:text-foreground ${
                          on ? "ring-2 ring-primary/60" : ""
                        }`}
                        style={{
                          backgroundColor: `color-mix(in oklab, ${tm.colorVar} 22%, var(--card))`,
                          boxShadow: `inset 3px 0 0 ${tm.colorVar}`,
                        }}
                      >
                        <span className="hidden sm:inline">{a.title}</span>
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {blocked && !canWrite && <ViewerNote canWrite={false} />}

      {draftDay != null && (
        <div className="animate-pop-in rounded-xl border border-primary/40 bg-primary/5 p-3.5">
          <p className="text-xs font-semibold text-primary">
            Hoạt động mới · ngày {draftDay}/{m + 1}
          </p>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Tên hoạt động, ví dụ: Workshop vẽ tranh"
            maxLength={60}
            className="mt-2 h-10 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring/40 sm:text-sm"
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                aria-pressed={type === t.value}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  type === t.value
                    ? "border-primary bg-card text-foreground"
                    : "border-border bg-card/60 text-muted-foreground"
                }`}
              >
                <TypeDot color={t.colorVar} />
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="hero" disabled={!title.trim()} onClick={submit}>
              Ghi vào nhật ký
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDraftDay(null)}>
              Hủy
            </Button>
          </div>
        </div>
      )}

      <SelectedSummary a={selected} month={`Th ${m + 1}`} />
    </div>
  );
}

/* ---------- 2. Ảnh & ghi âm ---------- */

const WAVE = [6, 12, 8, 16, 10, 18, 7, 13, 9, 15, 6, 11, 17, 8, 14, 10, 7, 12, 9, 15];

function VoiceClip({ seconds, index }: { seconds: number; index: number }) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setPlaying(false), Math.min(seconds, 6) * 1000);
    return () => clearTimeout(id);
  }, [playing, seconds]);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Dừng" : "Nghe lại"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-grape text-grape-foreground shadow-btn"
      >
        {playing ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current" />
        )}
      </button>
      <div className="relative flex flex-1 items-center gap-[3px]" aria-hidden>
        {WAVE.map((h, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full transition-colors ${
              playing ? "animate-pulse bg-grape" : "bg-grape/45"
            }`}
            style={{ height: h, animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        Ghi âm {index + 1} · 0:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function MediaPanel({
  acts,
  selectedId,
  select,
  update,
  canWrite,
  onUse,
}: {
  acts: DemoActivity[];
  selectedId: string;
  select: (id: string) => void;
  update: Update;
  canWrite: boolean;
  onUse: () => void;
}) {
  const a = acts.find((x) => x.id === selectedId) ?? acts[0];
  const [recording, setRecording] = useState(false);
  const [sec, setSec] = useState(0);
  const [bars, setBars] = useState(WAVE);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  function start() {
    if (!canWrite) return;
    setRecording(true);
    setSec(0);
    let s = 0;
    timer.current = setInterval(() => {
      s += 1;
      setSec(s);
    }, 1000);
  }

  // sóng âm nhảy khi đang ghi
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setBars(WAVE.map(() => 5 + Math.round(Math.random() * 16))), 140);
    return () => clearInterval(id);
  }, [recording]);

  function stop() {
    if (timer.current) clearInterval(timer.current);
    setRecording(false);
    const seconds = Math.max(2, sec);
    update(a.id, (x) => ({ ...x, voices: [...x.voices, seconds] }));
    onUse();
  }

  function addPhoto() {
    if (!canWrite || a.photos.length >= 6) return;
    const next = SAMPLE_PHOTOS[a.photos.length % SAMPLE_PHOTOS.length];
    update(a.id, (x) => ({ ...x, photos: [...x.photos, next] }));
    onUse();
  }

  return (
    <div className="space-y-3">
      <ActivityPicker acts={acts} selectedId={a.id} onSelect={select} />
      <ViewerNote canWrite={canWrite} />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="surface rounded-xl p-3.5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Ảnh · {a.photos.length}/6
          </p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {a.photos.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(src)}
                className="animate-pop-in aspect-square overflow-hidden rounded-lg"
                aria-label={`Xem ảnh ${i + 1}`}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </button>
            ))}
            {a.photos.length < 6 && (
              <button
                type="button"
                onClick={addPhoto}
                disabled={!canWrite}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors enabled:hover:border-primary enabled:hover:text-primary disabled:opacity-50"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px] font-medium">Thêm ảnh</span>
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Bấm vào ảnh để xem phóng to.</p>
        </div>

        <div className="surface rounded-xl p-3.5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Ghi âm · {a.voices.length}
          </p>
          <div className="mt-2.5 space-y-2">
            {a.voices.map((s, i) => (
              <VoiceClip key={i} seconds={s} index={i} />
            ))}
            {recording ? (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2.5">
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Dừng ghi âm"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
                <div className="flex flex-1 items-center gap-[3px]" aria-hidden>
                  {bars.map((h, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded-full bg-destructive/70 transition-[height] duration-100"
                      style={{ height: h }}
                    />
                  ))}
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium tabular-nums text-destructive">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                  0:
                  {String(sec).padStart(2, "0")}
                </span>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!canWrite}
                onClick={start}
              >
                <Mic className="h-4 w-4" /> Bấm để ghi âm
              </Button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Bản dùng thử chỉ mô phỏng ghi âm. Trong app thật, giọng của bạn được lưu lại.
          </p>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label="Xem ảnh"
        >
          <img src={lightbox} alt="" className="max-h-[85vh] max-w-full rounded-xl shadow-pop" />
          <button
            type="button"
            aria-label="Đóng"
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- 3. Tương tác ---------- */

function EngagePanel({
  acts,
  selectedId,
  select,
  update,
  canWrite,
  onUse,
}: {
  acts: DemoActivity[];
  selectedId: string;
  select: (id: string) => void;
  update: Update;
  canWrite: boolean;
  onUse: () => void;
}) {
  const a = acts.find((x) => x.id === selectedId) ?? acts[0];
  const [text, setText] = useState("");
  const [burst, setBurst] = useState(0);
  const liked = a.likes.includes(ME);
  const attending = a.attendees.includes(ME);

  function toggle(field: "likes" | "attendees") {
    if (!canWrite) return;
    const has = a[field].includes(ME);
    update(a.id, (x) => ({
      ...x,
      [field]: has ? x[field].filter((n) => n !== ME) : [...x[field], ME],
    }));
    if (field === "likes" && !has) setBurst((b) => b + 1);
    onUse();
  }

  function post() {
    const t = text.trim();
    if (!t || !canWrite) return;
    update(a.id, (x) => ({ ...x, comments: [...x.comments, { who: ME, text: t }] }));
    setText("");
    onUse();
  }

  return (
    <div className="space-y-3">
      <ActivityPicker acts={acts} selectedId={a.id} onSelect={select} />
      <ViewerNote canWrite={canWrite} />

      <div className="surface space-y-4 rounded-xl p-4">
        <p className="font-display text-base font-semibold leading-snug">{a.title}</p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggle("likes")}
            disabled={!canWrite}
            aria-pressed={liked}
            className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              liked
                ? "border-rose-500 bg-rose-500 text-white"
                : "border-border bg-card text-foreground enabled:hover:border-rose-400"
            }`}
          >
            <span className="relative flex">
              {burst > 0 && liked && (
                <Heart
                  key={burst}
                  aria-hidden
                  className="animate-heart-burst absolute inset-0 h-4 w-4 fill-current text-rose-200"
                />
              )}
              <Heart className={`relative h-4 w-4 ${liked ? "fill-current" : ""}`} />
            </span>
            Thả tim · {a.likes.length}
          </button>

          <button
            type="button"
            onClick={() => toggle("attendees")}
            disabled={!canWrite}
            aria-pressed={attending}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              attending
                ? "border-transparent bg-mint text-mint-foreground"
                : "border-border bg-card text-foreground enabled:hover:border-primary/50"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            {attending ? "Đã tham gia" : "Đánh dấu tham gia"} · {a.attendees.length}
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Bình luận · {a.comments.length}
          </p>
          <ul className="mt-2 space-y-2">
            {a.comments.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Chưa có bình luận nào. Hãy viết thử một câu!
              </li>
            )}
            {a.comments.map((c, i) => (
              <li key={i} className="animate-pop-in flex gap-2.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    c.who === ME
                      ? "bg-gradient-primary text-primary-foreground"
                      : "bg-gradient-grape text-grape-foreground"
                  }`}
                >
                  {c.who.charAt(0)}
                </span>
                <div className="rounded-xl bg-muted/60 px-3 py-1.5 text-sm">
                  <span className="font-semibold">{c.who}</span>
                  <span className="text-muted-foreground"> · </span>
                  {c.text}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && post()}
              disabled={!canWrite}
              placeholder={canWrite ? "Viết bình luận…" : "Người xem không bình luận được"}
              maxLength={140}
              className="h-10 flex-1 rounded-full border border-input bg-card px-4 text-base outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60 sm:text-sm"
            />
            <Button
              type="button"
              size="icon"
              className="h-10 w-10"
              aria-label="Gửi bình luận"
              disabled={!text.trim() || !canWrite}
              onClick={post}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. Phân quyền ---------- */

function RolesPanel({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Vai trò">
        {(Object.keys(ROLE_META) as Role[]).map((r) => {
          const on = role === r;
          return (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setRole(r)}
              className={`rounded-xl border p-3 text-left transition-all ${
                on
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <p className="text-sm font-semibold">{ROLE_META[r].label}</p>
              <p className="mt-0.5 hidden text-[11px] leading-snug text-muted-foreground sm:block">
                {ROLE_META[r].blurb}
              </p>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground sm:hidden">{ROLE_META[role].blurb}</p>

      <ul className="surface divide-y divide-border rounded-xl">
        {PERMISSIONS.map((p) => {
          const ok = p.roles.includes(role);
          return (
            <li key={p.label} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  ok ? "bg-mint text-mint-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <span
                className={
                  ok ? "" : "text-muted-foreground line-through decoration-muted-foreground/40"
                }
              >
                {p.label}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Thử đổi sang “Người xem” rồi quay lại tab Lịch, Ảnh hoặc Tương tác: các nút sẽ bị khóa. Ảnh
        và ghi âm luôn nằm trong kho riêng, chỉ thành viên đã được duyệt mới mở được.
      </p>
    </div>
  );
}

/* ---------- 5. Báo cáo ---------- */

function ReportPanel({ acts, onUse }: { acts: DemoActivity[]; onUse: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const photos = acts.reduce((s, a) => s + a.photos.length, 0);
  const people = acts.reduce((s, a) => s + a.participants, 0);
  const hearts = acts.reduce((s, a) => s + a.likes.length, 0);
  const byType = ACTIVITY_TYPES.map((t) => ({
    ...t,
    n: acts.filter((a) => a.type === t.value).length,
  })).filter((t) => t.n > 0);
  const max = Math.max(1, ...byType.map((t) => t.n));

  function exportDemo() {
    setState("busy");
    onUse();
    setTimeout(() => setState("done"), 1100);
  }

  return (
    <div className="space-y-3">
      <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-border bg-white text-[oklch(0.28_0.04_30)] shadow-pop">
        <div className="relative">
          <img src={group} alt="" className="h-20 w-full object-cover" />
          <div className="bg-gradient-hero px-4 py-3 text-white">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/85">
              Báo cáo hành trình · Nét Mơ
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold leading-tight">
              Season 2 — Chuyện của Mây
            </p>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              [acts.length, "hoạt động"],
              [people, "lượt tham gia"],
              [photos, "ảnh"],
              [hearts, "lượt tim"],
            ].map(([v, l]) => (
              <div key={l as string} className="rounded-lg border border-black/10 py-2">
                <p className="text-gradient font-display text-xl font-semibold tabular-nums">{v}</p>
                <p className="text-[9px] text-black/55">{l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {byType.map((t) => (
              <div key={t.value} className="flex items-center gap-2 text-[11px]">
                <span className="w-20 shrink-0 text-black/65">{t.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${(t.n / max) * 100}%`, backgroundColor: t.colorVar }}
                  />
                </div>
                <span className="w-4 text-right font-semibold tabular-nums">{t.n}</span>
              </div>
            ))}
          </div>
          <ul className="space-y-1 border-t border-black/10 pt-2.5">
            {[...acts]
              .sort((a, b) => a.day - b.day)
              .map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-[11px]">
                  <TypeDot color={typeMeta(a.type).colorVar} />
                  <span className="w-8 shrink-0 font-semibold tabular-nums text-black/55">
                    {a.day}
                  </span>
                  <span className="truncate">{a.title}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button type="button" variant="hero" onClick={exportDemo} disabled={state === "busy"}>
          <FileDown className="h-4 w-4" />
          {state === "busy" ? "Đang tạo…" : "Xuất PDF mẫu"}
        </Button>
        {state === "done" && (
          <p className="animate-pop-in text-center text-xs text-muted-foreground">
            Trong app thật, file PDF có đủ ảnh của từng hoạt động sẽ tải về, sẵn sàng gửi nhà tài
            trợ.
          </p>
        )}
        <p className="text-center text-xs text-muted-foreground">
          Thử thêm hoạt động hoặc ảnh ở các tab khác, rồi quay lại: báo cáo tự cập nhật.
        </p>
      </div>
    </div>
  );
}

/* ---------- 6. Màu dự án ---------- */

function ThemePanel({ theme, setTheme }: { theme: string; setTheme: (k: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl shadow-pop">
        <img src={group} alt="" className="h-32 w-full object-cover sm:h-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
            Nét Mơ
          </p>
          <p className="font-display text-xl font-semibold leading-tight">
            Season 2 — Chuyện của Mây
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {PROJECT_THEMES.map((t) => {
          const on = theme === t.key;
          const end = "h2" in t ? t.h2 : t.hue - 76;
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={on}
              onClick={() => setTheme(t.key)}
              className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                on
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-btn"
                style={{
                  backgroundImage: `linear-gradient(135deg, oklch(0.78 0.15 ${t.hue + 34}), oklch(0.62 0.19 ${end}))`,
                }}
              >
                {on && <Check className="h-4 w-4" />}
              </span>
              <span className="text-sm font-semibold">{t.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Nhìn lên đầu trang: nút, tiêu đề và nền của cả trang này vừa đổi màu theo. Trong app, mỗi dự
        án chọn một màu riêng cùng ảnh bìa riêng.
      </p>
    </div>
  );
}

/* ---------- khung chính ---------- */

export function LandingDemo() {
  const now = useMemo(() => new Date(), []);
  const [acts, setActs] = useState<DemoActivity[]>(SEED_ACTIVITIES);
  const [selectedId, setSelectedId] = useState("a1");
  const [role, setRole] = useState<Role>("admin");
  const [tab, setTab] = useState<DemoTab>("lich");
  const [theme, setThemeKey] = useState("coral");
  const [tried, setTried] = useState<Set<DemoTab>>(new Set());
  const canWrite = role !== "viewer";

  const mark = useCallback((t: DemoTab) => {
    setTried((prev) => (prev.has(t) ? prev : new Set(prev).add(t)));
  }, []);

  const update: Update = useCallback((id, fn) => {
    setActs((prev) => prev.map((a) => (a.id === id ? fn(a) : a)));
  }, []);

  // đổi màu cả trang (không lưu lại), trả về mặc định khi rời trang
  useEffect(() => {
    if (theme === "coral") clearThemeVars();
    else applyThemeVars(theme, false);
  }, [theme]);
  useEffect(() => {
    return () => clearThemeVars();
  }, []);

  function addActivity(day: number, title: string, type: ActivityType) {
    const id = `n${Date.now()}`;
    setActs((prev) => [
      ...prev,
      {
        id,
        title,
        day,
        type,
        participants: 0,
        likes: [],
        attendees: [],
        comments: [],
        photos: [],
        voices: [],
      },
    ]);
    setSelectedId(id);
    mark("lich");
  }

  function selectActivity(id: string) {
    setSelectedId(id);
    mark("lich");
  }

  const current = DEMO_TABS.find((t) => t.key === tab)!;
  const triedCount = tried.size;

  return (
    <section id="dung-thu" className="scroll-mt-20 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Dùng thử ngay
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight sm:text-5xl">
            Tự tay thử, <em className="text-gradient font-medium">không cần đăng nhập.</em>
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Đây là bản thu nhỏ của app thật, chạy ngay trong trang này với dữ liệu mẫu. Bấm vào
            lịch, ghi âm, thả tim, đổi vai trò, đổi màu… thử gì cũng được.
          </p>
        </div>

        <div className="surface mt-10 overflow-hidden rounded-3xl shadow-pop">
          {/* thanh tiêu đề giả lập app */}
          <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-sunny" />
              <span className="h-2.5 w-2.5 rounded-full bg-mint" />
            </div>
            <p className="min-w-0 flex-1 truncate text-xs font-semibold text-muted-foreground">
              Season 2 — Chuyện của Mây
            </p>
            <span className="hidden rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:block">
              {ROLE_META[role].label}
            </span>
            <span className="rounded-full bg-sunny px-2.5 py-0.5 text-[10px] font-semibold text-sunny-foreground">
              Dữ liệu minh họa
            </span>
          </div>

          <div className="grid lg:grid-cols-[15rem_1fr]">
            {/* thanh chọn tính năng */}
            <div
              role="tablist"
              aria-label="Tính năng"
              className="flex gap-2 overflow-x-auto border-b border-border p-3 lg:flex-col lg:gap-1 lg:border-b-0 lg:border-r lg:p-4"
            >
              {DEMO_TABS.map((t, i) => {
                const on = tab === t.key;
                const done = tried.has(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setTab(t.key)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full ${
                      on
                        ? "bg-gradient-to-b from-primary/15 to-primary/5 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_20%,transparent)]"
                        : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        done
                          ? "bg-mint text-mint-foreground"
                          : on
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className="whitespace-nowrap">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* nội dung */}
            <div className="min-w-0 p-4 sm:p-6">
              <p className="mb-4 text-sm font-medium text-muted-foreground">{current.hint}</p>
              <div key={tab} className="animate-pop-in">
                {tab === "lich" && (
                  <CalendarPanel
                    now={now}
                    acts={acts}
                    selectedId={selectedId}
                    select={selectActivity}
                    add={addActivity}
                    canWrite={canWrite}
                  />
                )}
                {tab === "media" && (
                  <MediaPanel
                    acts={acts}
                    selectedId={selectedId}
                    select={setSelectedId}
                    update={update}
                    canWrite={canWrite}
                    onUse={() => mark("media")}
                  />
                )}
                {tab === "tuong-tac" && (
                  <EngagePanel
                    acts={acts}
                    selectedId={selectedId}
                    select={setSelectedId}
                    update={update}
                    canWrite={canWrite}
                    onUse={() => mark("tuong-tac")}
                  />
                )}
                {tab === "vai-tro" && (
                  <RolesPanel
                    role={role}
                    setRole={(r) => {
                      setRole(r);
                      mark("vai-tro");
                    }}
                  />
                )}
                {tab === "bao-cao" && <ReportPanel acts={acts} onUse={() => mark("bao-cao")} />}
                {tab === "mau" && (
                  <ThemePanel
                    theme={theme}
                    setTheme={(k) => {
                      setThemeKey(k);
                      mark("mau");
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* lời mời đăng nhập */}
          <div className="flex flex-col items-start justify-between gap-3 border-t border-border bg-gradient-to-r from-secondary/60 to-accent/30 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="font-display text-lg font-semibold leading-snug">
                {triedCount === 0
                  ? "Bấm thử một tính năng bên trên nhé."
                  : triedCount < DEMO_TABS.length
                    ? `Bạn đã thử ${triedCount}/${DEMO_TABS.length} tính năng. Thích rồi chứ?`
                    : "Bạn đã thử hết rồi. Giờ làm thật nhé!"}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Đăng nhập bằng Google để tạo nhật ký thật cho đội của bạn.
              </p>
            </div>
            <Button asChild variant="hero" size="lg" className="shrink-0">
              <Link to="/auth">
                Vào nhật ký thật
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
