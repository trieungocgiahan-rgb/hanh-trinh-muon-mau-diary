import type { ActivityWithExtras } from "@/hooks/use-activities";
import { typeMeta, statusMeta } from "@/lib/activity-constants";

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildMarkdown(projectName: string, orgName: string, activities: ActivityWithExtras[]): string {
  const total = activities.length;
  const workshops = activities.filter((a) => a.type === "workshop").length;
  const participants = activities.reduce((s, a) => s + (a.participant_count ?? 0), 0);
  const completed = activities.filter((a) => a.status === "completed").length;

  const lines: string[] = [];
  lines.push(`# Báo cáo hành trình — ${projectName}`);
  lines.push(`*Tổ chức: ${orgName}*`);
  lines.push(`*Xuất ngày: ${new Date().toLocaleDateString("vi-VN")}*`);
  lines.push("");
  lines.push("## Tổng quan");
  lines.push("");
  lines.push(`- **Tổng số hoạt động:** ${total}`);
  lines.push(`- **Số workshop:** ${workshops}`);
  lines.push(`- **Tổng lượt tham gia:** ${participants}`);
  lines.push(`- **Đã hoàn thành:** ${completed}`);
  lines.push("");
  lines.push("## Chi tiết hoạt động");
  lines.push("");

  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));
  for (const a of sorted) {
    const tm = typeMeta(a.type);
    const sm = statusMeta(a.status);
    lines.push(`### ${a.title}`);
    lines.push("");
    lines.push(`- **Ngày:** ${fmtDate(a.date)}`);
    lines.push(`- **Loại:** ${tm.label}`);
    lines.push(`- **Trạng thái:** ${sm.label}`);
    if (a.location) lines.push(`- **Địa điểm:** ${a.location}`);
    if (a.participant_count != null) lines.push(`- **Số người tham gia:** ${a.participant_count}`);
    if (a.author_name) lines.push(`- **Người ghi:** ${a.author_name}`);
    lines.push("");
    if (a.highlight) {
      lines.push(`> ${a.highlight}`);
      lines.push("");
    }
    if (a.summary) {
      lines.push(`**Diễn biến chính:**`);
      lines.push(a.summary);
      lines.push("");
    }
    if (a.issues) {
      lines.push(`**Vấn đề phát sinh:**`);
      lines.push(a.issues);
      lines.push("");
    }
    if (a.next_steps) {
      lines.push(`**Bước tiếp theo:**`);
      lines.push(a.next_steps);
      lines.push("");
    }
    const photos = a.attachments.filter((x) => x.kind === "photo").length;
    const links = a.attachments.filter((x) => x.kind === "link");
    if (photos || a.attachments.length) {
      const parts: string[] = [];
      if (photos) parts.push(`${photos} ảnh`);
      const audio = a.attachments.filter((x) => x.kind === "audio").length;
      const video = a.attachments.filter((x) => x.kind === "video").length;
      const docs = a.attachments.filter((x) => x.kind === "document").length;
      if (audio) parts.push(`${audio} ghi âm`);
      if (video) parts.push(`${video} video`);
      if (docs) parts.push(`${docs} tài liệu`);
      if (parts.length) lines.push(`*Đính kèm: ${parts.join(", ")}*`);
      links.forEach((l) => lines.push(`- 🔗 ${l.url}`));
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function markdownToHtml(md: string): string {
  // Minimal markdown -> HTML for a .doc export
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = md
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ")) return `<h3>${esc(line.slice(4))}</h3>`;
      if (line.startsWith("## ")) return `<h2>${esc(line.slice(3))}</h2>`;
      if (line.startsWith("# ")) return `<h1>${esc(line.slice(2))}</h1>`;
      if (line.startsWith("> ")) return `<blockquote>${esc(line.slice(2))}</blockquote>`;
      if (line.startsWith("- ")) return `<li>${esc(line.slice(2))}</li>`;
      if (line === "---") return "<hr/>";
      if (line.trim() === "") return "<br/>";
      return `<p>${esc(line)}</p>`;
    })
    .join("\n")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:'Segoe UI',sans-serif;line-height:1.6;color:#2b2b2b;max-width:800px;margin:0 auto;padding:24px}
    h1{color:#e0603a}h2{color:#9b4bd6;border-bottom:2px solid #eee;padding-bottom:4px}
    blockquote{border-left:4px solid #f3a712;background:#fdf6ec;padding:8px 16px;font-style:italic;margin:8px 0}
    hr{border:none;border-top:1px dashed #ccc;margin:16px 0}
  </style></head><body>${html}</body></html>`;
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
