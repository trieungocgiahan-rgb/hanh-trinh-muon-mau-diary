import { useRef, useState } from "react";
import { Heart, MapPin, MessageCircle, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PersonAvatar } from "@/components/PersonAvatar";
import { SignedAudio, SignedImage } from "@/components/activity/SignedMedia";
import { TypeDot } from "@/components/activity/TypeDot";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { ActivityWithExtras } from "@/hooks/use-activities";
import { statusMeta, typeMeta } from "@/lib/activity-constants";
import { useI18n, type Key } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function relativeLabel(dateStr: string, t: (k: Key, p?: Record<string, string | number>) => string, locale: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return t("feed.today");
  if (diff === 1) return t("feed.yesterday");
  if (diff > 1 && diff < 7) return t("feed.daysAgo", { n: diff });
  if (diff < 0 && diff > -7) return t("feed.inDays", { n: -diff });
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" }).format(d);
}

function PhotoGrid({
  paths,
  title,
  onOpen,
  onDoubleLike,
}: {
  paths: string[];
  title: string;
  onOpen: () => void;
  onDoubleLike: () => void;
}) {
  const shown = paths.slice(0, 4);
  const extra = paths.length - 4;
  const lastTap = useRef(0);
  function tap() {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      onDoubleLike();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      window.setTimeout(() => {
        if (lastTap.current === now) {
          lastTap.current = 0;
          onOpen();
        }
      }, 330);
    }
  }
  const cell = "h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-[1.03]";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={tap}
      onKeyDown={(e) => (e.key === "Enter" ? onOpen() : undefined)}
      className={cn(
        "group/img grid cursor-pointer gap-0.5 overflow-hidden bg-muted",
        shown.length === 1 && "aspect-[4/3]",
        shown.length === 2 && "aspect-[2/1] grid-cols-2",
        shown.length === 3 && "aspect-[4/3] grid-cols-2 grid-rows-2",
        shown.length >= 4 && "aspect-[5/4] grid-cols-2 grid-rows-2",
      )}
    >
      {shown.map((p, i) => (
        <div
          key={p}
          className={cn("relative overflow-hidden", shown.length === 3 && i === 0 && "row-span-2")}
        >
          <SignedImage path={p} alt={title} className={cell} />
          {i === 3 && extra > 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-bold text-white">
              +{extra}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function FeedPost({
  activity,
  projectId,
  onOpen,
}: {
  activity: ActivityWithExtras;
  projectId: string;
  onOpen: () => void;
}) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  const tm = typeMeta(activity.type);
  const sm = statusMeta(activity.status);
  const photos = activity.attachments
    .filter((a) => a.kind === "photo" && a.storage_path)
    .map((a) => a.storage_path as string);
  const voices = activity.attachments.filter((a) => a.kind === "audio" && a.storage_path);
  const queryKey = ["activities", projectId, user?.id];

  async function setLike(next: boolean) {
    if (!user || busy) return;
    setBusy(true);
    // cập nhật ngay trên màn hình, lỗi thì hoàn lại
    qc.setQueryData<ActivityWithExtras[]>(queryKey, (old) =>
      old?.map((a) =>
        a.id === activity.id
          ? { ...a, liked_by_me: next, like_count: Math.max(0, a.like_count + (next ? 1 : -1)) }
          : a,
      ),
    );
    if (next) setBurst((n) => n + 1);
    try {
      if (next) {
        const { error } = await supabase.from("activity_likes").insert({ activity_id: activity.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("activity_likes")
          .delete()
          .eq("activity_id", activity.id)
          .eq("user_id", user.id);
        if (error) throw error;
      }
      qc.invalidateQueries({ queryKey: ["engagement", activity.id] });
    } catch {
      toast.error(t("engage.likeFail"));
      qc.invalidateQueries({ queryKey: ["activities", projectId] });
    } finally {
      setBusy(false);
    }
  }

  const author = activity.author_name ?? t("common.anonymous");
  const when = relativeLabel(activity.date, t, locale);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center gap-3 px-4 py-3">
        <PersonAvatar name={author} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{author}</p>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            {activity.location ? (
              <>
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{activity.location}</span>
                <span aria-hidden>·</span>
              </>
            ) : null}
            <span className="shrink-0">{when}</span>
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          <TypeDot color={tm.colorVar} />
          {t(tm.labelKey)}
        </span>
      </header>

      {photos.length > 0 && (
        <div className="relative">
          <PhotoGrid
            paths={photos}
            title={activity.title}
            onOpen={onOpen}
            onDoubleLike={() => (activity.liked_by_me ? setBurst((n) => n + 1) : setLike(true))}
          />
          {burst > 0 && (
            <Heart
              key={burst}
              aria-hidden
              className="animate-like-pop pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 fill-white text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
            />
          )}
        </div>
      )}

      {voices.length > 0 && (
        <div className="space-y-2 px-4 pt-3">
          {voices.slice(0, 2).map((v) => (
            <SignedAudio key={v.id} path={v.storage_path as string} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 px-2 pt-2">
        <button
          type="button"
          onClick={() => setLike(!activity.liked_by_me)}
          aria-pressed={activity.liked_by_me}
          aria-label={activity.liked_by_me ? t("engage.liked") : t("engage.like")}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent active:scale-90"
        >
          <Heart
            key={activity.liked_by_me ? "on" : "off"}
            className={cn(
              "h-6 w-6 transition-transform",
              activity.liked_by_me ? "animate-like-pop-sm fill-primary text-primary" : "text-foreground",
            )}
          />
        </button>
        <button
          type="button"
          onClick={onOpen}
          aria-label={t("feed.comments")}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent active:scale-90"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
        {activity.participant_count != null && (
          <span className="ml-auto mr-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            {t("feed.people", { n: activity.participant_count })}
          </span>
        )}
      </div>

      <div className="space-y-1.5 px-4 pb-4 pt-1">
        {activity.like_count > 0 && (
          <p className="text-sm font-semibold">
            {t(activity.like_count === 1 ? "feed.like.one" : "feed.like.other", { n: activity.like_count })}
          </p>
        )}
        <button type="button" onClick={onOpen} className="block w-full text-left">
          <h3 className="font-display text-lg font-bold leading-snug text-foreground">{activity.title}</h3>
          {activity.summary && (
            <p className="mt-1 line-clamp-3 text-sm leading-6 text-foreground/80">{activity.summary}</p>
          )}
        </button>
        {activity.highlight && (
          <blockquote className="border-l-[3px] border-primary pl-3 text-sm italic leading-6 text-muted-foreground">
            “{activity.highlight}”
          </blockquote>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", sm.className)}>
            {t(sm.labelKey)}
          </span>
          {activity.comment_count > 0 && (
            <button
              type="button"
              onClick={onOpen}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {t(activity.comment_count === 1 ? "feed.viewComment.one" : "feed.viewComment.other", {
                n: activity.comment_count,
              })}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-5" aria-busy>
      {[0, 1].map((i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
