import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/use-project";
import { useAuth } from "@/hooks/use-auth";
import { usePendingCount } from "@/hooks/use-pending-count";
import { useProjectBranding, useApplyTheme } from "@/hooks/use-project-branding";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { ROLE_LABEL_KEYS } from "@/lib/activity-constants";
import { ActivityDialogProvider, useActivityDialog } from "@/hooks/use-activity-dialog";
import { ActivityFormDialog } from "@/components/activity/ActivityFormDialog";
import { ActivityDetailSheet } from "@/components/activity/ActivityDetailSheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OnboardingPanel } from "@/components/Onboarding";
import { CommandPalette } from "@/components/CommandPalette";
import { PersonAvatar } from "@/components/PersonAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarDays,
  Newspaper,
  Search,
  Check,
  ChevronsUpDown,
  BarChart3,
  Users,
  FileText,
  Plus,
  LogOut,
  ChevronDown,
  Hourglass,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

const NAV = [
  { to: "/danh-sach", label: "nav.list", icon: Newspaper },
  { to: "/lich", label: "nav.calendar", icon: CalendarDays },
  { to: "/thong-ke", label: "nav.stats", icon: BarChart3 },
  { to: "/thanh-vien", label: "nav.members", icon: Users },
  { to: "/bao-cao", label: "nav.report", icon: FileText },
] as const;

// Thanh dưới trên điện thoại: 4 mục chính và nút + ở giữa
const MOBILE_NAV = [NAV[0], NAV[1], "add", NAV[2], NAV[3]] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ActivityDialogProvider>
      <ShellInner>{children}</ShellInner>
      <ActivityFormDialog />
      <ActivityDetailSheet />
    </ActivityDialogProvider>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { current, projects, setCurrentId, canEdit, isAdmin, pendingApproval, needsOnboarding } =
    useProject();
  const { openCreate } = useActivityDialog();
  const { user } = useAuth();
  const pendingCount = usePendingCount();
  const { theme, setTheme } = useTheme();
  const [checking, setChecking] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const branding = useProjectBranding(current?.id);
  useApplyTheme(branding.theme);
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? t("common.account");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // phím tắt: ⌘K / Ctrl+K hoặc "/" mở bảng lệnh, "n" viết mục mới
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing =
        !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key.toLowerCase() === "n" && canEdit) {
        e.preventDefault();
        openCreate();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canEdit, openCreate]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success(t("shell.signedOut"));
    navigate({ to: "/auth", replace: true });
  }

  async function recheck() {
    setChecking(true);
    await qc.invalidateQueries({ queryKey: ["my-projects"] });
    setChecking(false);
    toast.info(t("shell.stillPending"), {
      description: t("shell.stillPendingDesc"),
    });
  }

  if (needsOnboarding) {
    return (
      <div className="relative min-h-screen bg-background px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl animate-pop-in">
          <BrandMark className="h-12 w-12" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("shell.welcome")}
          </p>
          <h1 className="mt-2 text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {t("shell.howStart")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {displayName !== t("common.account") ? t("shell.hello", { name: displayName }) : ""}
            {t("shell.chooseWay")}
          </p>
          <div className="mt-8">
            <OnboardingPanel />
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <LogOut className="h-4 w-4" /> {t("common.signOut")}
          </button>
        </div>
      </div>
    );
  }

  if (pendingApproval) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[var(--page-tint)] px-4 py-10">
        <div className="surface w-full max-w-md animate-pop-in rounded-2xl p-8 text-center shadow-pop">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-sun shadow-btn">
            <Hourglass className="h-8 w-8 text-foreground/80" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {t("shell.pendingTitle")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("shell.pendingBody")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t("shell.pendingHint")}</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button variant="hero" onClick={recheck} disabled={checking}>
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />{" "}
              {t("shell.checkAgain")}
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4" /> {t("common.signOut")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = current?.role ? t(ROLE_LABEL_KEYS[current.role]) : "";

  const navLink = (item: (typeof NAV)[number]) => {
    const active = pathname === item.to;
    return (
      <Link
        key={item.to}
        to={item.to}
        className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
          active
            ? "bg-accent font-semibold text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <item.icon className={`h-[18px] w-[18px] ${active ? "text-primary" : ""}`} />
        {t(item.label)}
        {item.to === "/thanh-vien" && pendingCount > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {pendingCount}
          </span>
        )}
      </Link>
    );
  };

  const userMenu = (
    <DropdownMenuContent align="end" side="top" className="w-60">
      <DropdownMenuLabel>
        <div className="truncate font-medium">{displayName}</div>
        <div className="truncate text-xs font-normal text-muted-foreground">{user?.email}</div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
        {t("themeMode.appearance")}
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
        <DropdownMenuRadioItem value="light">
          <Sun className="mr-2 h-4 w-4" /> {t("themeMode.light")}
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">
          <Moon className="mr-2 h-4 w-4" /> {t("themeMode.dark")}
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system">
          <Laptop className="mr-2 h-4 w-4" /> {t("themeMode.system")}
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      {isAdmin && (
        <DropdownMenuItem asChild>
          <Link to="/cai-dat">
            <Settings className="h-4 w-4" /> {t("shell.projectSettings")}
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => setJoinOpen(true)}>
        <Plus className="h-4 w-4" /> {t("shell.joinOrCreate")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={signOut} className="text-destructive">
        <LogOut className="h-4 w-4" /> {t("common.signOut")}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* thanh bên (máy tính): đổi dự án, tìm nhanh, viết mục mới, điều hướng */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar px-3 py-3 lg:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-accent"
            >
              <BrandMark className="h-9 w-9 rounded-lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold leading-tight">
                  {current?.name ?? BRAND}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{roleLabel || BRAND}</span>
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {t("shell.otherProjects")}
            </DropdownMenuLabel>
            {projects.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => setCurrentId(p.id)}>
                <span className="truncate">{p.name}</span>
                {p.id === current?.id && <Check className="ml-auto h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setJoinOpen(true)}>
              <Plus className="h-4 w-4" /> {t("shell.joinOrCreate")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mt-3 flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40"
        >
          <Search className="h-4 w-4" />
          {t("shell.search")}
          <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-semibold">
            ⌘K
          </kbd>
        </button>

        {canEdit && (
          <Button className="mt-3 w-full justify-center" onClick={() => openCreate()}>
            <Plus className="h-4 w-4" /> {t("shell.logActivity")}
          </Button>
        )}

        <nav className="mt-4 space-y-0.5">{NAV.map(navLink)}</nav>

        <div className="mt-auto space-y-1">
          {isAdmin && (
            <Link
              to="/cai-dat"
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                pathname === "/cai-dat"
                  ? "bg-accent font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Settings className="h-[18px] w-[18px]" /> {t("shell.projectSettings")}
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-accent"
              >
                <PersonAvatar name={displayName} className="h-8 w-8" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{displayName}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            {userMenu}
          </DropdownMenu>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* thanh trên (điện thoại) */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <Link to="/danh-sach" className="flex min-w-0 items-center gap-2">
            <BrandMark className="h-8 w-8 rounded-lg" />
            <span className="truncate text-sm font-bold">{current?.name ?? BRAND}</span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label={t("shell.search")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
            >
              <Search className="h-5 w-5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label={t("common.account")} className="rounded-full">
                  <PersonAvatar name={displayName} className="h-8 w-8" />
                </button>
              </DropdownMenuTrigger>
              {userMenu}
            </DropdownMenu>
          </div>
        </header>

        <main
          key={pathname}
          className="animate-page-in mx-auto max-w-6xl px-4 pb-28 pt-6 lg:px-10 lg:pb-12 lg:pt-8"
        >
          {children}
        </main>
      </div>

      {/* thanh dưới (điện thoại): nút + ở giữa như Instagram */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 items-end border-t border-border bg-background/95 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur lg:hidden">
        {MOBILE_NAV.map((item, i) => {
          if (item === "add") {
            return canEdit ? (
              <button
                key="add"
                type="button"
                onClick={() => openCreate()}
                aria-label={t("shell.logActivity")}
                className="mx-auto -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-btn ring-4 ring-background transition-transform active:scale-90"
              >
                <Plus className="h-7 w-7" />
              </button>
            ) : (
              <span key={`sp${i}`} />
            );
          }
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${
                active ? "text-primary-ink" : "text-muted-foreground"
              }`}
            >
              <span className="relative">
                <item.icon className={`h-6 w-6 ${active ? "text-primary" : ""}`} />
                {item.to === "/thanh-vien" && pendingCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {pendingCount}
                  </span>
                )}
              </span>
              {t(item.label)}
            </Link>
          );
        })}
      </nav>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t("shell.otherProjects")}</DialogTitle>
          </DialogHeader>
          <OnboardingPanel onDone={() => setJoinOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
