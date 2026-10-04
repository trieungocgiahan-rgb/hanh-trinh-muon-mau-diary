import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatCode } from "@/components/Onboarding";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/use-project";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABEL_KEYS, type ProjectRole } from "@/lib/activity-constants";
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
import { Loader2, UserMinus, Info, Check, X, Link2, Share2, Copy, RefreshCw } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useI18n, tNow } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/thanh-vien")({
  head: () => ({ meta: [{ title: `${tNow("nav.members")} — ${BRAND}` }] }),
  component: MembersPage,
});

interface Member {
  id: string;
  user_id: string;
  role: ProjectRole;
  full_name: string | null;
}

function MembersPage() {
  const { t } = useI18n();
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

  // Mã mời: đọc riêng và chịu lỗi, để trang vẫn chạy nếu máy chủ chưa có cột này
  const { data: inviteCode } = useQuery({
    queryKey: ["invite-code", current?.id],
    enabled: !!current,
    retry: false,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select("invite_code")
        .eq("id", current!.id)
        .maybeSingle();
      if (error) return null;
      return data?.invite_code ?? null;
    },
  });

  async function copyCode() {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(formatCode(inviteCode));
    toast.success(t("members.codeCopied"));
  }

  async function regenerateCode() {
    const { error } = await supabase.rpc("regenerate_invite_code", { _project_id: current!.id });
    if (error) {
      toast.error(t("members.codeChangeFail"));
      return;
    }
    toast.success(t("members.codeChanged"), { description: t("members.codeChangedDesc") });
    qc.invalidateQueries({ queryKey: ["invite-code", current?.id] });
  }

  async function shareInvite() {
    const url = window.location.origin;
    const codeLine = inviteCode
      ? t("members.invite.codeLine", { code: formatCode(inviteCode) })
      : "";
    const text = t("members.invite.text", {
      brand: BRAND,
      project: current?.name ?? t("members.projectFallback"),
      code: codeLine,
    });
    try {
      if (navigator.share) {
        await navigator.share({ title: BRAND, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success(t("members.inviteCopied"), { description: t("members.inviteCopiedDesc") });
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error(t("members.inviteCopyFail"));
    }
  }

  async function changeRole(member: Member, role: ProjectRole) {
    const { error } = await supabase.from("memberships").update({ role }).eq("id", member.id);
    if (error) {
      toast.error(t("members.roleChangeFail"));
      return;
    }
    toast.success(t("members.roleChanged", { role: t(ROLE_LABEL_KEYS[role]) }));
    qc.invalidateQueries({ queryKey: ["members", current?.id] });
    qc.invalidateQueries({ queryKey: ["members-pending", current?.id] });
  }

  async function approveMember(member: Member) {
    const { error } = await supabase
      .from("memberships")
      .update({ role: "member" })
      .eq("id", member.id);
    if (error) {
      toast.error(t("members.approveFail"));
      return;
    }
    toast.success(t("members.approved", { name: member.full_name ?? t("members.memberLower") }));
    qc.invalidateQueries({ queryKey: ["members", current?.id] });
    qc.invalidateQueries({ queryKey: ["members-pending", current?.id] });
  }

  async function removeMember(member: Member) {
    const { error } = await supabase.from("memberships").delete().eq("id", member.id);
    if (error) {
      toast.error(t("members.removeFail"));
      return;
    }
    toast.success(t("members.removed"));
    qc.invalidateQueries({ queryKey: ["members", current?.id] });
    qc.invalidateQueries({ queryKey: ["members-pending", current?.id] });
  }

  const pendingMembers = (members ?? []).filter((m) => m.role === "pending");
  const activeMembers = (members ?? []).filter((m) => m.role !== "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("members.eyebrow")}
        title={t("nav.members")}
        description={t("members.desc", { name: current?.name ?? t("members.projectFallback") })}
      />

      <div className="surface rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t("members.code")}
            </p>
            {inviteCode ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-3xl font-semibold tracking-[0.2em]">
                  {formatCode(inviteCode)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("members.copyCode")}
                  onClick={copyCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={t("members.changeCode")}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("members.changeTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("members.changeBody")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={regenerateCode}>
                          {t("members.changeConfirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{t("members.codeLoading")}</p>
            )}
            <p className="mt-2 flex max-w-md items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {t("members.codeHelp")}
            </p>
          </div>
          <Button variant="hero" size="sm" className="shrink-0" onClick={shareInvite}>
            {typeof navigator !== "undefined" && "share" in navigator ? (
              <Share2 className="h-4 w-4" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            {t("members.sendInvite")}
          </Button>
        </div>
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
                {t("members.pending")}
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
                      <div className="truncate font-medium">
                        {m.full_name ?? t("common.unknownUser")}
                      </div>
                      <div className="text-xs text-muted-foreground">{t("members.waiting")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="hero"
                        size="sm"
                        className="rounded-full"
                        onClick={() => approveMember(m)}
                      >
                        <Check className="h-4 w-4" /> {t("members.approve")}
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
                            <AlertDialogTitle>{t("members.rejectTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("members.rejectBody", {
                                name: m.full_name ?? t("common.unknownUser"),
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMember(m)}
                              className="bg-none bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                            >
                              {t("members.reject")}
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
                    {m.full_name ?? t("common.unknownUser")}
                    {m.user_id === user?.id && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {t("members.you")}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{t(ROLE_LABEL_KEYS[m.role])}</div>
                </div>

                {isAdmin && m.user_id !== user?.id ? (
                  <div className="flex items-center gap-2">
                    <Select value={m.role} onValueChange={(v) => changeRole(m, v as ProjectRole)}>
                      <SelectTrigger className="h-9 w-32 rounded-full text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t("role.admin")}</SelectItem>
                        <SelectItem value="member">{t("role.member")}</SelectItem>
                        <SelectItem value="viewer">{t("role.viewer")}</SelectItem>
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
                          <AlertDialogTitle>{t("members.removeTitle")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("members.removeBody", {
                              name: m.full_name ?? t("common.unknownUser"),
                            })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeMember(m)}
                            className="bg-none bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                          >
                            {t("common.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {t(ROLE_LABEL_KEYS[m.role])}
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
