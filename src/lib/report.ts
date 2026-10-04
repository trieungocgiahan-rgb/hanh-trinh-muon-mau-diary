import type { ActivityWithExtras } from "@/hooks/use-activities";
import { typeMeta, statusMeta } from "@/lib/activity-constants";
import type { Key, Params } from "@/lib/i18n";

type T = (key: Key, params?: Params) => string;

function fmtDate(d: string, locale: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildMarkdown(
  projectName: string,
  orgName: string,
  activities: ActivityWithExtras[],
  t: T,
  locale: string,
): string {
  const total = activities.length;
  const workshops = activities.filter((a) => a.type === "workshop").length;
  const participants = activities.reduce((s, a) => s + (a.participant_count ?? 0), 0);
  const completed = activities.filter((a) => a.status === "completed").length;
  const bold = (key: Key) => `**${t(key)}:**`;

  const lines: string[] = [];
  lines.push(`# ${t("md.title", { project: projectName })}`);
  lines.push(`*${t("md.org", { org: orgName })}*`);
  lines.push(`*${t("md.exported", { date: new Date().toLocaleDateString(locale) })}*`);
  lines.push("");
  lines.push(`## ${t("md.overview")}`);
  lines.push("");
  lines.push(`- ${bold("md.total")} ${total}`);
  lines.push(`- ${bold("md.workshops")} ${workshops}`);
  lines.push(`- ${bold("md.participants")} ${participants}`);
  lines.push(`- ${bold("md.completed")} ${completed}`);
  lines.push("");
  lines.push(`## ${t("md.details")}`);
  lines.push("");

  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));
  for (const a of sorted) {
    const tm = typeMeta(a.type);
    const sm = statusMeta(a.status);
    lines.push(`### ${a.title}`);
    lines.push("");
    lines.push(`- ${bold("md.date")} ${fmtDate(a.date, locale)}`);
    lines.push(`- ${bold("md.type")} ${t(tm.labelKey)}`);
    lines.push(`- ${bold("md.status")} ${t(sm.labelKey)}`);
    if (a.location) lines.push(`- ${bold("md.location")} ${a.location}`);
    if (a.participant_count != null)
      lines.push(`- ${bold("md.participantsCount")} ${a.participant_count}`);
    if (a.author_name) lines.push(`- ${bold("md.author")} ${a.author_name}`);
    lines.push("");
    if (a.highlight) {
      lines.push(`> ${a.highlight}`);
      lines.push("");
    }
    if (a.summary) {
      lines.push(bold("detail.summary"));
      lines.push(a.summary);
      lines.push("");
    }
    if (a.issues) {
      lines.push(bold("detail.issues"));
      lines.push(a.issues);
      lines.push("");
    }
    if (a.next_steps) {
      lines.push(bold("detail.next"));
      lines.push(a.next_steps);
      lines.push("");
    }
    const photos = a.attachments.filter((x) => x.kind === "photo").length;
    const links = a.attachments.filter((x) => x.kind === "link");
    if (photos || a.attachments.length) {
      const parts: string[] = [];
      if (photos) parts.push(t("md.photos", { n: photos }));
      const audio = a.attachments.filter((x) => x.kind === "audio").length;
      const video = a.attachments.filter((x) => x.kind === "video").length;
      const docs = a.attachments.filter((x) => x.kind === "document").length;
      if (audio) parts.push(t("md.audio", { n: audio }));
      if (video) parts.push(t("md.video", { n: video }));
      if (docs) parts.push(t("md.docs", { n: docs }));
      if (parts.length) lines.push(`*${t("md.attachments", { list: parts.join(", ") })}*`);
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
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
