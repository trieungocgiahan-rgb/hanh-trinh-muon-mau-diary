import { typeMeta, statusMeta } from "@/lib/activity-constants";
import type { ActivityWithExtras } from "@/hooks/use-activities";
import { TypeDot } from "@/components/activity/TypeDot";
import { MapPin, Users, Paperclip, ImageIcon, Heart, MessageCircle, UserCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function ActivityCard({
  activity,
  onClick,
  index = 0,
}: {
  activity: ActivityWithExtras;
  onClick: () => void;
  index?: number;
}) {
  const { t, lang, locale } = useI18n();
  const tm = typeMeta(activity.type);
  const sm = statusMeta(activity.status);
  const photoCount = activity.attachments.filter((a) => a.kind === "photo").length;
  const otherCount = activity.attachments.length - photoCount;
  const date = new Date(activity.date + "T00:00:00");

  return (
    <button
      type="button"
      onClick={onClick}
      className="surface surface-lift animate-fade-up group flex w-full gap-4 rounded-2xl p-4 text-left"
      style={{ "--d": `${Math.min(index, 8) * 45}ms` } as React.CSSProperties}
    >
      <div
        className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in oklab, ${tm.colorVar} 14%, var(--card))`,
          color: `color-mix(in oklab, ${tm.colorVar} 70%, var(--foreground))`,
        }}
      >
        <span className="font-display text-2xl font-semibold leading-none tabular-nums">
          {date.getDate()}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">
          {t("card.monthShort", {
            n:
              lang === "vi"
                ? date.getMonth() + 1
                : new Intl.DateTimeFormat(locale, { month: "short" }).format(date),
          })}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <TypeDot color={tm.colorVar} />
            {t(tm.labelKey)}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sm.className}`}>
            {t(sm.labelKey)}
          </span>
        </div>
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-foreground">
          {activity.title}
        </h3>
        {activity.highlight && (
          <p className="mt-1 line-clamp-2 font-display text-sm italic text-muted-foreground">
            “{activity.highlight}”
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-muted-foreground">
          {activity.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {activity.location}
            </span>
          )}
          {activity.participant_count != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {activity.participant_count}
            </span>
          )}
          {photoCount > 0 && (
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" /> {photoCount}
            </span>
          )}
          {otherCount > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" /> {otherCount}
            </span>
          )}
          {activity.like_count > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-primary/70 text-primary" /> {activity.like_count}
            </span>
          )}
          {activity.comment_count > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5 text-grape" /> {activity.comment_count}
            </span>
          )}
          {activity.attendance_count > 0 && (
            <span className="flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-mint-foreground" />{" "}
              {t("card.attended", { n: activity.attendance_count })}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
