import type { ActivityType } from "@/lib/activity-constants";
import type { Key } from "@/lib/i18n";
import group from "@/assets/landing-group.jpg";
import sunset from "@/assets/landing-sunset.jpg";
import desk from "@/assets/landing-desk.jpg";

export type Role = "admin" | "member" | "viewer";
export type DemoTab = "lich" | "media" | "tuong-tac" | "vai-tro" | "bao-cao" | "mau";

// Mã định danh của người đang dùng thử; tên hiển thị lấy từ bộ dịch (demo.me).
export const ME = "__me__";

export interface DemoComment {
  who: string;
  text?: string;
  textKey?: Key;
}

export interface DemoActivity {
  id: string;
  title: string;
  titleKey?: Key;
  day: number;
  type: ActivityType;
  participants: number;
  likes: string[];
  attendees: string[];
  comments: DemoComment[];
  photos: string[];
  voices: number[]; // thời lượng (giây) của từng đoạn ghi âm
}

export const SAMPLE_PHOTOS = [group, sunset, desk];

export const SEED_ACTIVITIES: DemoActivity[] = [
  {
    id: "a1",
    title: "Workshop khởi động dự án",
    titleKey: "demo.seed.a1",
    day: 3,
    type: "workshop",
    participants: 24,
    likes: ["Linh", "Huy"],
    attendees: ["Linh", "Mai", "Huy"],
    comments: [{ who: "Linh", textKey: "demo.seed.c1" }],
    photos: [group],
    voices: [],
  },
  {
    id: "a2",
    title: "Họp đội ngũ tuần 2",
    titleKey: "demo.seed.a2",
    day: 8,
    type: "team_meeting",
    participants: 9,
    likes: ["Mai"],
    attendees: ["Mai"],
    comments: [],
    photos: [],
    voices: [],
  },
  {
    id: "a3",
    title: "Khảo sát thực địa",
    titleKey: "demo.seed.a3",
    day: 15,
    type: "site_visit",
    participants: 18,
    likes: ["Huy"],
    attendees: ["Huy", "Linh"],
    comments: [],
    photos: [sunset],
    voices: [34],
  },
  {
    id: "a4",
    title: "Sự kiện ra mắt",
    titleKey: "demo.seed.a4",
    day: 22,
    type: "event",
    participants: 60,
    likes: [],
    attendees: [],
    comments: [],
    photos: [],
    voices: [],
  },
];

export const ROLE_META: Record<Role, { label: Key; blurb: Key }> = {
  admin: { label: "demo.role.admin", blurb: "demo.role.admin.blurb" },
  member: { label: "demo.role.member", blurb: "demo.role.member.blurb" },
  viewer: { label: "demo.role.viewer", blurb: "demo.role.viewer.blurb" },
};

export const PERMISSIONS: { label: Key; roles: Role[] }[] = [
  { label: "demo.perm.view", roles: ["admin", "member", "viewer"] },
  { label: "demo.perm.create", roles: ["admin", "member"] },
  { label: "demo.perm.react", roles: ["admin", "member"] },
  { label: "demo.perm.editOthers", roles: ["admin"] },
  { label: "demo.perm.admin", roles: ["admin"] },
];

export const DEMO_TABS: { key: DemoTab; label: Key; hint: Key }[] = [
  { key: "lich", label: "demo.tab.lich.label", hint: "demo.tab.lich.hint" },
  { key: "media", label: "demo.tab.media.label", hint: "demo.tab.media.hint" },
  { key: "tuong-tac", label: "demo.tab.tuong-tac.label", hint: "demo.tab.tuong-tac.hint" },
  { key: "vai-tro", label: "demo.tab.vai-tro.label", hint: "demo.tab.vai-tro.hint" },
  { key: "bao-cao", label: "demo.tab.bao-cao.label", hint: "demo.tab.bao-cao.hint" },
  { key: "mau", label: "demo.tab.mau.label", hint: "demo.tab.mau.hint" },
];
