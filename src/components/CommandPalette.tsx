import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  FileText,
  ListChecks,
  Moon,
  Plus,
  Settings,
  Sun,
  BarChart3,
  Users,
  Search,
  FolderOpen,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useActivities } from "@/hooks/use-activities";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import { useProject } from "@/hooks/use-project";
import { useTheme } from "@/hooks/use-theme";
import { typeMeta } from "@/lib/activity-constants";
import { useI18n } from "@/lib/i18n";

// Bảng lệnh kiểu Notion: ⌘K hoặc Ctrl+K (hoặc "/") để nhảy trang, tìm mục, làm nhanh.
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { current, projects, setCurrentId, canEdit, isAdmin } = useProject();
  const { data: activities } = useActivities(current?.id);
  const { openCreate, openDetail } = useActivityDialog();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    // chờ hộp thoại đóng rồi mới làm, tránh tranh giành focus
    window.setTimeout(fn, 60);
  };

  const pages = [
    { to: "/danh-sach", label: t("nav.list"), icon: ListChecks },
    { to: "/lich", label: t("nav.calendar"), icon: CalendarDays },
    { to: "/thong-ke", label: t("nav.stats"), icon: BarChart3 },
    { to: "/thanh-vien", label: t("nav.members"), icon: Users },
    { to: "/bao-cao", label: t("nav.report"), icon: FileText },
    ...(isAdmin ? [{ to: "/cai-dat", label: t("shell.projectSettings"), icon: Settings }] : []),
  ];

  const entries = useMemo(() => (activities ?? []).slice(0, 40), [activities]);
  const isDark = theme === "dark" || (theme === "system" && typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput value={query} onValueChange={setQuery} placeholder={t("palette.placeholder")} />
      <CommandList className="max-h-[min(60vh,28rem)]">
        <CommandEmpty>{t("palette.empty")}</CommandEmpty>

        <CommandGroup heading={t("palette.actions")}>
          {canEdit && (
            <CommandItem value="new entry write log add" onSelect={() => run(() => openCreate())}>
              <Plus /> {t("shell.logActivity")}
              <span className="ml-auto text-xs text-muted-foreground">N</span>
            </CommandItem>
          )}
          <CommandItem value="theme dark light mode" onSelect={() => run(() => setTheme(isDark ? "light" : "dark"))}>
            {isDark ? <Sun /> : <Moon />} {isDark ? t("themeMode.toLight") : t("themeMode.toDark")}
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading={t("palette.pages")}>
          {pages.map((p) => (
            <CommandItem key={p.to} value={`go ${p.label}`} onSelect={() => run(() => navigate({ to: p.to }))}>
              <p.icon /> {p.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {entries.length > 0 && (
          <CommandGroup heading={t("palette.entries")}>
            {entries.map((a) => {
              const d = new Date(a.date + "T00:00:00");
              return (
                <CommandItem
                  key={a.id}
                  value={`${a.title} ${a.location ?? ""} ${t(typeMeta(a.type).labelKey)}`}
                  onSelect={() => run(() => openDetail(a))}
                >
                  <Search />
                  <span className="truncate">{a.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(d)}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {projects.length > 1 && (
          <CommandGroup heading={t("palette.projects")}>
            {projects.map((p) => (
              <CommandItem key={p.id} value={`project ${p.name}`} onSelect={() => run(() => setCurrentId(p.id))}>
                <FolderOpen /> {p.name}
                {p.id === current?.id && <span className="ml-auto text-xs text-muted-foreground">{t("palette.current")}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
