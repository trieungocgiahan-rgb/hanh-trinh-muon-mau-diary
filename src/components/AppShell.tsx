import { type ReactNode } from "react";
import logoAsset from "@/assets/logo.png.asset.json";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/use-project";
import { ROLE_LABELS } from "@/lib/activity-constants";
import { ActivityDialogProvider, useActivityDialog } from "@/hooks/use-activity-dialog";
import { ActivityFormDialog } from "@/components/activity/ActivityFormDialog";
import { ActivityDetailSheet } from "@/components/activity/ActivityDetailSheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  const { current, projects, setCurrentId, canEdit, pendingApproval } = useProject();
  const { openCreate } = useActivityDialog();
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

  if (pendingApproval) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-10">
        <div className="w-full max-w-md animate-pop-in rounded-3xl bg-card p-8 text-center shadow-pop">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-sun shadow-soft">
            <Hourglass className="h-8 w-8 text-foreground/80" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Chờ duyệt</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Tài khoản của bạn đã được tạo và đang chờ quản trị viên duyệt. Khi được chấp
            nhận, bạn sẽ có thể xem và ghi lại hành trình cùng cả đội.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Hãy liên hệ quản trị viên nếu bạn cần được duyệt sớm.
          </p>
          <Button variant="outline" className="mt-6 rounded-full" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/lich" className="flex shrink-0 items-center gap-2">
            <img
              src={logoAsset.url}
              alt="Nhật Ký Hành Trình"
              className="h-9 w-9 rounded-xl object-cover shadow-soft"
            />
            <span className="hidden font-display text-lg font-bold sm:block">Nhật Ký Hành Trình</span>
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
              <span className="ml-1 hidden truncate rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground lg:block">
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
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            {canEdit && (
              <Button variant="hero" size="sm" className="hidden md:inline-flex" onClick={() => openCreate()}>
                <Plus className="h-4 w-4" /> Ghi hoạt động
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-grape text-sm font-semibold text-grape-foreground">
                    {current?.role ? ROLE_LABELS[current.role].charAt(0) : "?"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="font-medium">{current?.name ?? "—"}</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    Vai trò: {current?.role ? ROLE_LABELS[current.role] : "—"}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      {/* mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border/70 bg-background/95 px-1 py-1.5 backdrop-blur-md md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* mobile floating add button */}
      {canEdit && (
        <button
          type="button"
          onClick={() => openCreate()}
          className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground shadow-pop transition-transform active:scale-95 md:hidden"
          aria-label="Ghi hoạt động"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
