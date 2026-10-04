import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { useMemo, useState } from "react";
import { useProject } from "@/hooks/use-project";
import { useActivities } from "@/hooks/use-activities";
import { buildMarkdown, markdownToHtml, downloadFile } from "@/lib/report";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, FileDown, Copy, Loader2, FileType2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useI18n, tNow } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/bao-cao")({
  head: () => ({ meta: [{ title: `${tNow("report.pageTitle")} — ${BRAND}` }] }),
  component: ReportPage,
});

function ReportPage() {
  const { t, locale } = useI18n();
  const { current } = useProject();
  const { data: activities, isLoading } = useActivities(current?.id);
  const [copied, setCopied] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(
    () => (activities ?? []).filter((a) => (!from || a.date >= from) && (!to || a.date <= to)),
    [activities, from, to],
  );

  function setPreset(kind: "all" | "month" | "quarter" | "year") {
    const now = new Date();
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (kind === "all") {
      setFrom("");
      setTo("");
    } else if (kind === "month") {
      setFrom(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
      setTo(iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
    } else if (kind === "quarter") {
      setFrom(iso(new Date(now.getFullYear(), now.getMonth() - 2, 1)));
      setTo(iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
    } else {
      setFrom(iso(new Date(now.getFullYear(), 0, 1)));
      setTo(iso(new Date(now.getFullYear(), 11, 31)));
    }
  }

  function openPdf() {
    const qs = new URLSearchParams({ auto: "1" });
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    window.open(`/in-bao-cao?${qs.toString()}`, "_blank");
  }

  const markdown = useMemo(() => {
    if (!current || !activities) return "";
    return buildMarkdown(current.name, current.org_name, filtered, t, locale);
  }, [current, activities, filtered, t, locale]);

  const slug = (current?.name ?? "bao-cao")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  function copyMd() {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success(t("report.copied"));
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("report.eyebrow")}
        title={t("report.pageTitle")}
        description={t("report.desc")}
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section className="surface space-y-4 rounded-2xl p-5">
            <div>
              <h2 className="font-display text-xl font-semibold">{t("report.period")}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t(filtered.length === 1 ? "report.periodCount.one" : "report.periodCount.other", {
                  n: filtered.length,
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["all", "report.p.all"],
                  ["month", "report.p.month"],
                  ["quarter", "report.p.quarter"],
                  ["year", "report.p.year"],
                ] as const
              ).map(([k, label]) => (
                <Button
                  key={k}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset(k)}
                >
                  {t(label)}
                </Button>
              ))}
            </div>
            <div className="grid max-w-md grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="from" className="text-xs font-medium text-muted-foreground">
                  {t("report.from")}
                </label>
                <Input
                  id="from"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="to" className="text-xs font-medium text-muted-foreground">
                  {t("report.to")}
                </label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          </section>

          <div className="surface flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">{t("report.pdfTitle")}</h2>
              <p className="mt-0.5 max-w-lg text-sm text-muted-foreground">{t("report.pdfDesc")}</p>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="shrink-0"
              onClick={openPdf}
              disabled={!filtered.length}
            >
              <FileType2 className="h-4 w-4" /> {t("report.exportPdf")}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                downloadFile(markdown, `bao-cao-${slug}.md`, "text/markdown;charset=utf-8");
                toast.success(t("report.mdDone"));
              }}
            >
              <FileDown className="h-4 w-4" /> {t("report.mdBtn")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                downloadFile(
                  markdownToHtml(markdown),
                  `bao-cao-${slug}.doc`,
                  "application/msword;charset=utf-8",
                );
                toast.success(t("report.wordDone"));
              }}
            >
              <FileText className="h-4 w-4" /> {t("report.wordBtn")}
            </Button>
            <Button variant="outline" onClick={copyMd}>
              <Copy className="h-4 w-4" /> {copied ? t("report.copiedBtn") : t("report.copy")}
            </Button>
          </div>

          <div className="surface rounded-2xl p-5">
            <h2 className="mb-3 font-display text-sm font-semibold text-muted-foreground">
              {t("report.preview")}
            </h2>
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-muted/40 p-4 text-sm leading-relaxed">
              {markdown || t("report.noActivities")}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
