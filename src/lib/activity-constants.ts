import type { Database } from "@/integrations/supabase/types";
import type { Key } from "@/lib/i18n";

export type ActivityType = Database["public"]["Enums"]["activity_type"];
export type ActivityStatus = Database["public"]["Enums"]["activity_status"];
export type ProjectRole = Database["public"]["Enums"]["project_role"];
export type AttachmentKind = Database["public"]["Enums"]["attachment_kind"];

export type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
export type AttachmentRow = Database["public"]["Tables"]["attachments"]["Row"];

export const ACTIVITY_TYPES: {
  value: ActivityType;
  labelKey: Key;
  emoji: string;
  colorVar: string;
}[] = [
  { value: "workshop", labelKey: "type.workshop", emoji: "🎨", colorVar: "var(--type-workshop)" },
  {
    value: "team_meeting",
    labelKey: "type.team_meeting",
    emoji: "🤝",
    colorVar: "var(--type-team)",
  },
  {
    value: "partner_meeting",
    labelKey: "type.partner_meeting",
    emoji: "🤲",
    colorVar: "var(--type-partner)",
  },
  { value: "site_visit", labelKey: "type.site_visit", emoji: "🏡", colorVar: "var(--type-site)" },
  { value: "event", labelKey: "type.event", emoji: "🎉", colorVar: "var(--type-event)" },
  { value: "other", labelKey: "type.other", emoji: "✨", colorVar: "var(--type-other)" },
];

export const ACTIVITY_STATUSES: {
  value: ActivityStatus;
  labelKey: Key;
  className: string;
}[] = [
  { value: "completed", labelKey: "status.completed", className: "bg-mint text-mint-foreground" },
  { value: "ongoing", labelKey: "status.ongoing", className: "bg-sunny text-sunny-foreground" },
  { value: "planned", labelKey: "status.planned", className: "bg-accent text-accent-foreground" },
  { value: "issue", labelKey: "status.issue", className: "bg-destructive/15 text-destructive" },
];

export const ROLE_LABEL_KEYS: Record<ProjectRole, Key> = {
  admin: "role.admin",
  member: "role.member",
  viewer: "role.viewer",
  pending: "role.pending",
};

export function typeMeta(t: ActivityType) {
  return ACTIVITY_TYPES.find((x) => x.value === t) ?? ACTIVITY_TYPES[5];
}

export function statusMeta(s: ActivityStatus) {
  return ACTIVITY_STATUSES.find((x) => x.value === s) ?? ACTIVITY_STATUSES[2];
}

export const MONTH_KEYS: Key[] = [
  "month.1",
  "month.2",
  "month.3",
  "month.4",
  "month.5",
  "month.6",
  "month.7",
  "month.8",
  "month.9",
  "month.10",
  "month.11",
  "month.12",
];

export const WEEKDAY_KEYS: Key[] = [
  "weekday.1",
  "weekday.2",
  "weekday.3",
  "weekday.4",
  "weekday.5",
  "weekday.6",
  "weekday.7",
];
