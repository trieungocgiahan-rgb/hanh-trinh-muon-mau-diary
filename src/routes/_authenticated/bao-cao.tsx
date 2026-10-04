import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useMemo, useState } from "react";
import { useProject } from "@/hooks/use-project";
import { useActivities } from "@/hooks/use-activities";
import { buildMarkdown, markdownToHtml, downloadFile } from "@/lib/report";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, FileDown, Copy, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/bao-cao")({
  head: () => ({ meta: [{ title: "Xuất báo cáo — Nhật Ký Hành Trình" }] }),
  component: ReportPage,
});

function ReportPage() {
  const { current } = useProject();
  const { data: activities, isLoading } = useActivities(current?.id);
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => {
    if (!current || !activities) return "";
    return buildMarkdown(current.name, current.org_name, activities);
  }, [current, activities]);

  const slug = (current?.name ?? "bao-cao")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  function copyMd() {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Đã sao chép báo cáo");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Gửi đi"
        title="Xuất báo cáo"
        description="Tạo báo cáo tổng hợp để gửi cố vấn và nhà tài trợ"
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="hero"
              onClick={() => {
                downloadFile(markdown, `bao-cao-${slug}.md`, "text/markdown;charset=utf-8");
                toast.success("Đã tải báo cáo Markdown");
              }}
            >
              <FileDown className="h-4 w-4" /> Tải Markdown (.md)
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                downloadFile(
                  markdownToHtml(markdown),
                  `bao-cao-${slug}.doc`,
                  "application/msword;charset=utf-8",
                );
                toast.success("Đã tải báo cáo Word");
              }}
            >
              <FileText className="h-4 w-4" /> Tải Word (.doc)
            </Button>
            <Button variant="outline" onClick={copyMd}>
              <Copy className="h-4 w-4" /> {copied ? "Đã sao chép" : "Sao chép"}
            </Button>
          </div>

          <div className="surface rounded-2xl p-5">
            <h2 className="mb-3 font-display text-sm font-semibold text-muted-foreground">
              Xem trước
            </h2>
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-muted/40 p-4 text-sm leading-relaxed">
              {markdown || "Chưa có hoạt động nào để xuất báo cáo."}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
