import type { ActivityType } from "@/lib/activity-constants";
import group from "@/assets/landing-group.jpg";
import sunset from "@/assets/landing-sunset.jpg";
import desk from "@/assets/landing-desk.jpg";

export type Role = "admin" | "member" | "viewer";
export type DemoTab = "lich" | "media" | "tuong-tac" | "vai-tro" | "bao-cao" | "mau";

export const ME = "Bạn";

export interface DemoComment {
  who: string;
  text: string;
}

export interface DemoActivity {
  id: string;
  title: string;
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
    day: 3,
    type: "workshop",
    participants: 24,
    likes: ["Linh", "Huy"],
    attendees: ["Linh", "Mai", "Huy"],
    comments: [{ who: "Linh", text: "Buổi này hay quá, mình học được nhiều thứ." }],
    photos: [group],
    voices: [],
  },
  {
    id: "a2",
    title: "Họp đội ngũ tuần 2",
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

export const ROLE_META: Record<Role, { label: string; blurb: string }> = {
  admin: { label: "Quản trị viên", blurb: "Quản lý toàn bộ dự án và duyệt thành viên." },
  member: { label: "Thành viên", blurb: "Ghi hoạt động và sửa phần của chính mình." },
  viewer: { label: "Người xem", blurb: "Chỉ đọc, dành cho cố vấn và nhà tài trợ." },
};

export const PERMISSIONS: { label: string; roles: Role[] }[] = [
  { label: "Xem lịch, ảnh và báo cáo", roles: ["admin", "member", "viewer"] },
  { label: "Ghi hoạt động mới", roles: ["admin", "member"] },
  { label: "Thả tim, bình luận, điểm danh", roles: ["admin", "member"] },
  { label: "Sửa hoạt động của người khác", roles: ["admin"] },
  { label: "Duyệt thành viên, đổi cài đặt dự án", roles: ["admin"] },
];

export const DEMO_TABS: { key: DemoTab; label: string; hint: string }[] = [
  { key: "lich", label: "Lịch", hint: "Bấm vào một ngày để ghi hoạt động mới." },
  { key: "media", label: "Ảnh & ghi âm", hint: "Thêm ảnh, ghi âm giọng nói ngay tại chỗ." },
  { key: "tuong-tac", label: "Tương tác", hint: "Thả tim, điểm danh và bình luận." },
  { key: "vai-tro", label: "Phân quyền", hint: "Đổi vai trò để xem mỗi người làm được gì." },
  { key: "bao-cao", label: "Báo cáo", hint: "Báo cáo tự cập nhật theo những gì bạn vừa thêm." },
  { key: "mau", label: "Màu dự án", hint: "Mỗi dự án một màu, đổi là cả giao diện đổi theo." },
];
