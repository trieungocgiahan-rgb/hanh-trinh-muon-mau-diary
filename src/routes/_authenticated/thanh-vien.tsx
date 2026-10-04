import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/use-project";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS, type ProjectRole } from "@/lib/activity-constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, UserMinus, Info, Check, X, Link2, Share2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/thanh-vien")({
  head: () => ({ meta: [{ title: "Thành viên — Nhật Ký Hành Trình" }] }),
  component: MembersPage,
});

interface Member {
  id: string;
  user_id: string;
  role: ProjectRole;
  full_name: string | null;
}

function MembersPage() {
  const { current, isAdmin } = useProject();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", current?.id],
    enabled: !!current,
    queryFn: async (): Promise<Member[]> => {
      const { data: ms, error } = await supabase
        .from("memberships")
        .select("id, user_id, role")
        .eq("project_id", current!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const ids = (ms ?? []).map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
      return (ms ?? []).map((m) => ({ ...m, full_name: nameMap.get(m.user_id) ?? null }));
    },
  });

  async function shareInvite() {
    const url = window.location.origin;
    const text = `Mời bạn vào Nhật Ký Hành Trình của ${current?.name ?? "dự án"}. Đăng nhập bằng Google, sau đó chờ quản trị viên duyệt:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Nhật Ký Hành Trình", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Đã sao chép lời mời", { description: "Dán vào Zalo, Messenger hoặc email." });
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error("Không sao chép được link mời");
    }
  }

  async function changeRole(member: Member, role: ProjectRole) {
    const { error } = await supabase.from("memberships").update({ role }).eq("id", member.id);
    if (error) {
      toast.error("Không đổi được vai trò");
      return;
    }
    toast.success(`Đã đổi vai trò thành ${ROLE_LABELS[role]}`);
    qc.invalidateQueries({ queryKey: ["members", current?.id] });
    qc.invalidateQueries({ queryKey: ["members-pending", current?.id] });
  }

  async function approveMember(member: Member) {
    const { error } = await supabase
      .from("memberships")
      .update({ role: "member" })
      .eq("id", member.id);
    if (error) {
      toast.error("Không duyệt được thành viên");
      return;
    }
    toast.success(`Đã duyệt ${member.full_name ?? "thành viên"} 🎉`);
    qc.invalidateQueries({ queryKey: ["members", current?.id] });
    qc.invalidateQueries({ queryKey: ["members-pending", current?.id] });
  }

  async function removeMember(member: Member) {
    const { error } = await supabase.from("memberships").delete().eq("id", member.id);
    if (error) {
      toast.error("Không xóa được thành viên");
      return;
    }
    toast.success("Đã xóa thành viên khỏi dự án");
    qc.invalidateQueries({ queryKey: ["members", current?.id] });
    qc.invalidateQueries({ queryKey: ["members-pending", current?.id] });
  }

  const pendingMembers = (members ?? []).filter((m) => m.role === "pending");
  const activeMembers = (members ?? []).filter((m) => m.role !== "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cả đội"
        title="Thành viên"
        description={`Những người cùng viết nên hành trình của ${current?.name ?? "dự án"}`}
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-accent-foreground/10 bg-gradient-to-r from-accent/70 to-accent/30 p-4 text-sm text-accent-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Mời người mới bằng cách gửi link ứng dụng. Họ đăng nhập bằng Google rồi ở trạng thái{" "}
            <strong>Chờ duyệt</strong> cho đến khi quản trị viên duyệt.
          </p>
        </div>
        <Button variant="hero" size="sm" className="shrink-0" onClick={shareInvite}>
          {typeof navigator !== "undefined" && "share" in navigator ? (
            <Share2 className="h-4 w-4" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          Gửi lời mời
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {isAdmin && pendingMembers.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-semibold">
                Chờ duyệt
                <span className="rounded-full bg-sunny px-2 py-0.5 text-xs font-semibold text-sunny-foreground">
                  {pendingMembers.length}
                </span>
              </h2>
              <div className="overflow-hidden surface rounded-2xl">
                {pendingMembers.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${idx > 0 ? "border-t border-border" : ""}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-grape text-sm font-semibold text-grape-foreground shadow-btn">
                      {(m.full_name ?? "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{m.full_name ?? "Người dùng"}</div>
                      <div className="text-xs text-muted-foreground">Đang chờ được duyệt</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="hero"
                        size="sm"
                        className="rounded-full"
                        onClick={() => approveMember(m)}
                      >
                        <Check className="h-4 w-4" /> Duyệt
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Từ chối yêu cầu này?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {m.full_name ?? "Người dùng"} sẽ không được tham gia dự án. Họ có thể
                              đăng ký lại sau.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMember(m)}
                              className="bg-none bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                            >
                              Từ chối
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden surface rounded-2xl">
            {activeMembers.map((m, idx) => (
              <div
                key={m.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${idx > 0 ? "border-t border-border" : ""}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-grape text-sm font-semibold text-grape-foreground shadow-btn">
                  {(m.full_name ?? "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {m.full_name ?? "Người dùng"}
                    {m.user_id === user?.id && (
                      <span className="ml-1.5 text-xs text-muted-foreground">(bạn)</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{ROLE_LABELS[m.role]}</div>
                </div>

                {isAdmin && m.user_id !== user?.id ? (
                  <div className="flex items-center gap-2">
                    <Select value={m.role} onValueChange={(v) => changeRole(m, v as ProjectRole)}>
                      <SelectTrigger className="h-9 w-32 rounded-full text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Quản trị</SelectItem>
                        <SelectItem value="member">Thành viên</SelectItem>
                        <SelectItem value="viewer">Người xem</SelectItem>
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa thành viên này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {m.full_name ?? "Người dùng"} sẽ không còn truy cập được dự án này.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeMember(m)}
                            className="bg-none bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {ROLE_LABELS[m.role]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
