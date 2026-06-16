import { Badge } from "@/components/ui/badge";
import { typeMeta, statusMeta } from "@/lib/activity-constants";
import type { ActivityWithExtras } from "@/hooks/use-activities";
import { CalendarDays, MapPin, Users, Paperclip, ImageIcon } from "lucide-react";

function shortDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
}

export function ActivityCard({
  activity,
  onClick,
}: {
  activity: ActivityWithExtras;
  onClick: () => void;
}) {
  const tm = typeMeta(activity.type);
  const sm = statusMeta(activity.status);
  const photoCount = activity.attachments.filter((a) => a.kind === "photo").length;
  const otherCount = activity.attachments.length - photoCount;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-pop"
    >
      <div className="w-1.5 shrink-0" style={{ backgroundColor: tm.colorVar }} />
      <div className="flex-1 p-4">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <Badge className="border-0 text-white" style={{ backgroundColor: tm.colorVar }}>
            {tm.emoji} {tm.label}
          </Badge>
          <Badge variant="secondary" className={sm.className}>
            {sm.label}
          </Badge>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
          {activity.title}
        </h3>
        {activity.highlight && (
          <p className="mt-1 line-clamp-2 text-sm italic text-muted-foreground">“{activity.highlight}”</p>
        )}
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {shortDate(activity.date)}
          </span>
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
        </div>
        {(activity.like_count > 0 ||
          activity.comment_count > 0 ||
          activity.attendance_count > 0) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            {activity.like_count > 0 && <span>❤️ {activity.like_count}</span>}
            {activity.comment_count > 0 && <span>💬 {activity.comment_count}</span>}
            {activity.attendance_count > 0 && (
              <span>👥 {activity.attendance_count} đã tham gia</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
