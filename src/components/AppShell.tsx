import { useState, type ReactNode } from "react";
import logoAsset from "@/assets/logo.png.asset.json";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/use-project";
import { useAuth } from "@/hooks/use-auth";
import { usePendingCount } from "@/hooks/use-pending-count";
import { useProjectBranding, useApplyTheme } from "@/hooks/use-project-branding";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { ROLE_LABELS } from "@/lib/activity-constants";
import { ActivityDialogProvider, useActivityDialog } from "@/hooks/use-activity-dialog";
import { ActivityFormDialog } from "@/components/activity/ActivityFormDialog";
import { ActivityDetailSheet } from "@/components/activity/ActivityDetailSheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OnboardingPanel } from "@/components/Onboarding";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  ListChecks,
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

const NAV = [
  { to: "/lich", label: "Lịch", icon: CalendarDays },
  { to: "/danh-sach", label: "Danh sách", icon: ListChecks },
  { to: "/thong-ke", label: "Thống kê", icon: BarChart3 },
  { to: "/thanh-vien", label: "Thành viên", icon: Users },
  { to: "/bao-cao", label: "Báo cáo", icon: FileText },
] as const;

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
  const { current, projects, setCurrentId, canEdit, isAdmin, pendingApproval, needsOnboarding } =
    useProject();
  const { openCreate } = useActivityDialog();
  const { user } = useAuth();
  const pendingCount = usePendingCount();
  const { theme, setTheme } = useTheme();
  const [checking, setChecking] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const branding = useProjectBranding(current?.id);
  useApplyTheme(branding.theme);
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Tài khoản";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Đã đăng xuất. Hẹn gặp lại!");
    navigate({ to: "/auth", replace: true });
  }

  async function recheck() {
    setChecking(true);
    await qc.invalidateQueries({ queryKey: ["my-projects"] });
    setChecking(false);
    toast.info("Tài khoản vẫn đang chờ duyệt", {
      description: "Khi quản trị viên duyệt, bấm Kiểm tra lại để vào ngay.",
    });
  }

  if (needsOnboarding) {
    return (
      <div className="grain relative min-h-screen bg-mesh-warm px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl animate-pop-in">
          <img
            src={logoAsset.url}
            alt="Nhật Ký Hành Trình"
            className="h-14 w-14 rounded-xl object-cover shadow-pop ring-4 ring-card"
          />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Chào mừng bạn
          </p>
          <h1 className="mt-2 text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Bạn muốn bắt đầu thế nào?
          </h1>
          <p className="mt-2 text-muted-foreground">
            {displayName !== "Tài khoản" ? `Xin chào ${displayName}. ` : ""}Chọn một cách để vào
            nhật ký của đội.
          </p>
          <div className="mt-8">
            <OnboardingPanel />
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  if (pendingApproval) {
    return (
      <div className="grain relative flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-10">
        <div className="surface w-full max-w-md animate-pop-in rounded-2xl p-8 text-center shadow-pop">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-sun shadow-btn">
            <Hourglass className="h-8 w-8 text-foreground/80" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Chờ duyệt</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Tài khoản của bạn đã được tạo và đang chờ quản trị viên duyệt. Khi được chấp nhận, bạn
            sẽ có thể xem và ghi lại hành trình cùng cả đội.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Hãy liên hệ quản trị viên nếu bạn cần được duyệt sớm.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button variant="hero" onClick={recheck} disabled={checking}>
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} /> Kiểm tra lại
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--page-tint)] via-background to-background bg-[length:100%_520px] bg-no-repeat pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 shadow-[inset_0_1px_0_var(--hi),0_8px_24px_-18px_oklch(0.46_0.1_30/0.35)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/lich" className="flex shrink-0 items-center gap-2">
            <img
              src={logoAsset.url}
              alt="Nhật Ký Hành Trình"
              className="h-10 w-10 rounded-xl object-cover shadow-soft ring-2 ring-card"
            />
            <span className="hidden font-display text-lg font-semibold sm:block">
              Nhật Ký Hành Trình
            </span>
          </Link>

          {projects.length > 1 ? (
            <Select value={current?.id} onValueChange={setCurrentId}>
              <SelectTrigger className="ml-1 h-9 w-auto max-w-[180px] rounded-full border-border/70 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            current && (
              <span className="ml-1 hidden max-w-[200px] truncate rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground xl:block">
                {current.name}
              </span>
            )
          )}

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gradient-to-b from-primary/15 to-primary/5 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_20%,transparent),inset_0_1px_0_var(--hi)]"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.to === "/thanh-vien" && pendingCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-btn">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            {canEdit && (
              <Button
                variant="hero"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => openCreate()}
              >
                <Plus className="h-4 w-4" /> Ghi hoạt động
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-grape text-sm font-semibold text-grape-foreground shadow-btn ring-2 ring-card">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="truncate font-medium">{displayName}</div>
                  <div className="truncate text-xs font-normal text-muted-foreground">
                    {current?.name ?? "—"}
                  </div>
                  <div className="text-xs font-normal text-muted-foreground">
                    Vai trò: {current?.role ? ROLE_LABELS[current.role] : "—"}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Giao diện
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
                  <DropdownMenuRadioItem value="light">
                    <Sun className="mr-2 h-4 w-4" /> Sáng
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon className="mr-2 h-4 w-4" /> Tối dịu
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Laptop className="mr-2 h-4 w-4" /> Theo thiết bị
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/cai-dat">
                      <Settings className="h-4 w-4" /> Cài đặt dự án
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setJoinOpen(true)}>
                  <Plus className="h-4 w-4" /> Tham gia / tạo dự án khác
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main key={pathname} className="animate-page-in mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {children}
      </main>

      {/* mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border/50 bg-background/90 px-1 py-1.5 shadow-[0_-8px_24px_-16px_oklch(0.46_0.1_30/0.35)] backdrop-blur-xl md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
                active ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {item.to === "/thanh-vien" && pendingCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {pendingCount}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* mobile floating add button */}
      {canEdit && (
        <Button
          type="button"
          onClick={() => openCreate()}
          size="icon"
          variant="hero"
          className="fixed bottom-20 right-4 z-30 h-14 w-14 rounded-full md:hidden"
          aria-label="Ghi hoạt động"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Dự án khác</DialogTitle>
          </DialogHeader>
          <OnboardingPanel onDone={() => setJoinOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
