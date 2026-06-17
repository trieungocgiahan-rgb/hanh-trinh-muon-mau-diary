import type { Database } from "@/integrations/supabase/types";

export type ActivityType = Database["public"]["Enums"]["activity_type"];
export type ActivityStatus = Database["public"]["Enums"]["activity_status"];
export type ProjectRole = Database["public"]["Enums"]["project_role"];
export type AttachmentKind = Database["public"]["Enums"]["attachment_kind"];

export type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
export type AttachmentRow = Database["public"]["Tables"]["attachments"]["Row"];

export const ACTIVITY_TYPES: { value: ActivityType; label: string; emoji: string; colorVar: string }[] = [
  { value: "workshop", label: "Workshop", emoji: "🎨", colorVar: "var(--type-workshop)" },
  { value: "team_meeting", label: "Họp team", emoji: "🤝", colorVar: "var(--type-team)" },
  { value: "partner_meeting", label: "Họp đối tác", emoji: "🤲", colorVar: "var(--type-partner)" },
  { value: "site_visit", label: "Thăm cơ sở", emoji: "🏡", colorVar: "var(--type-site)" },
  { value: "event", label: "Sự kiện", emoji: "🎉", colorVar: "var(--type-event)" },
  { value: "other", label: "Khác", emoji: "✨", colorVar: "var(--type-other)" },
];

export const ACTIVITY_STATUSES: {
  value: ActivityStatus;
  label: string;
  className: string;
}[] = [
  { value: "completed", label: "Hoàn thành", className: "bg-mint text-mint-foreground" },
  { value: "ongoing", label: "Đang diễn ra", className: "bg-sunny text-sunny-foreground" },
  { value: "planned", label: "Kế hoạch", className: "bg-accent text-accent-foreground" },
  { value: "issue", label: "Có vấn đề", className: "bg-destructive/15 text-destructive" },
];

export const ROLE_LABELS: Record<ProjectRole, string> = {
  admin: "Quản trị",
  member: "Thành viên",
  viewer: "Người xem",
  pending: "Chờ duyệt",
};

export function typeMeta(t: ActivityType) {
  return ACTIVITY_TYPES.find((x) => x.value === t) ?? ACTIVITY_TYPES[5];
}

export function statusMeta(s: ActivityStatus) {
  return ACTIVITY_STATUSES.find((x) => x.value === s) ?? ACTIVITY_STATUSES[2];
}

export const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export const WEEKDAY_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
