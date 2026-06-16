import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { useProject } from "@/hooks/use-project";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";
import type { ActivityWithExtras } from "@/hooks/use-activities";
import type { EngagementData, PersonRef } from "@/hooks/use-engagement";
import { toast } from "sonner";
import {
  Heart,
  UserCheck,
  Send,
  Trash2,
  ImagePlus,
  Loader2,
  MessageCircle,
} from "lucide-react";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-grape/15 text-xs font-bold text-grape">
      {initials(name) || "?"}
    </span>
  );
}

function PeopleList({ people, empty }: { people: PersonRef[]; empty: string }) {
  if (people.length === 0)
    return <p className="px-1 py-2 text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="max-h-60 space-y-1 overflow-y-auto">
      {people.map((p) => (
        <div key={p.user_id} className="flex items-center gap-2 rounded-lg px-1 py-1">
          <Avatar name={p.name} />
          <span className="text-sm">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} ngày trước`;
  return new Date(d).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
}

export function ActivityEngagement({
  activity,
  engagement,
}: {
  activity: ActivityWithExtras;
  engagement: EngagementData | undefined;
}) {
  const { user } = useAuth();
  const { canEdit, isAdmin } = useProject();
  const qc = useQueryClient();
  const photoRef = useRef<HTMLInputElement>(null);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [busyLike, setBusyLike] = useState(false);
  const [busyAttend, setBusyAttend] = useState(false);
  const [pop, setPop] = useState(false);
  const [uploading, setUploading] = useState(false);

  const likes = engagement?.likes ?? [];
  const attendance = engagement?.attendance ?? [];
  const comments = engagement?.comments ?? [];

  const myLike = likes.some((l) => l.user_id === user?.id);
  const myAttend = attendance.some((a) => a.user_id === user?.id);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["engagement", activity.id] });
    qc.invalidateQueries({ queryKey: ["activities"] });
  };

  async function toggleLike() {
    if (!user || busyLike) return;
    setBusyLike(true);
    try {
      if (myLike) {
        await supabase
          .from("activity_likes")
          .delete()
          .eq("activity_id", activity.id)
          .eq("user_id", user.id);
      } else {
        const { error } = await supabase
          .from("activity_likes")
          .insert({ activity_id: activity.id });
        if (error) throw error;
        setPop(true);
        setTimeout(() => setPop(false), 350);
      }
      refresh();
    } catch {
      toast.error("Không thể cập nhật lượt thích");
    } finally {
      setBusyLike(false);
    }
  }

  async function toggleAttend() {
    if (!user || busyAttend) return;
    setBusyAttend(true);
    try {
      if (myAttend) {
        await supabase
          .from("activity_attendance")
          .delete()
          .eq("activity_id", activity.id)
          .eq("user_id", user.id);
      } else {
        const { error } = await supabase
          .from("activity_attendance")
          .insert({ activity_id: activity.id });
        if (error) throw error;
        toast.success("Đã ghi nhận bạn tham gia! 🎉");
      }
      refresh();
    } catch {
      toast.error("Không thể cập nhật điểm danh");
    } finally {
      setBusyAttend(false);
    }
  }

  async function postComment() {
    const body = commentText.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      const { error } = await supabase
        .from("activity_comments")
        .insert({ activity_id: activity.id, body });
      if (error) throw error;
      setCommentText("");
      refresh();
    } catch {
      toast.error("Không gửi được bình luận");
    } finally {
      setPosting(false);
    }
  }

  async function deleteComment(id: string) {
    const { error } = await supabase.from("activity_comments").delete().eq("id", id);
    if (error) {
      toast.error("Không xóa được bình luận");
      return;
    }
    refresh();
  }

  async function contributePhotos(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = await uploadMedia(activity.project_id, activity.id, file, file.name);
        const { error } = await supabase.from("attachments").insert({
          activity_id: activity.id,
          kind: "photo",
          storage_path: path,
          file_name: file.name,
          mime_type: file.type,
        });
        if (error) throw error;
      }
      toast.success("Đã thêm ảnh đóng góp 💛");
      refresh();
    } catch {
      toast.error("Tải ảnh lên không thành công");
    } finally {
      setUploading(false);
      if (photoRef.current) photoRef.current.value = "";
    }
  }

  return (
    <section className="space-y-5 border-t pt-5">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-grape" />
        <h4 className="text-sm font-semibold">Tương tác của nhóm</h4>
      </div>

      {/* like + attendance */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={myLike ? "default" : "outline"}
          size="sm"
          disabled={!canEdit || busyLike}
          onClick={toggleLike}
          className={myLike ? "bg-rose-500 text-white hover:bg-rose-500/90" : ""}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${myLike ? "fill-current" : ""} ${
              pop ? "scale-150" : "scale-100"
            }`}
          />
          Thả tim
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
            >
              ❤️ {likes.length}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-60 rounded-2xl">
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Đã thả tim
            </p>
            <PeopleList people={likes} empty="Chưa có ai thả tim" />
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant={myAttend ? "default" : "outline"}
          size="sm"
          disabled={!canEdit || busyAttend}
          onClick={toggleAttend}
          className={myAttend ? "bg-mint text-mint-foreground hover:bg-mint/90" : ""}
        >
          <UserCheck className="h-4 w-4" />
          {myAttend ? "Đã tham gia" : "Đánh dấu tham gia"}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
            >
              👥 {attendance.length} đã tham gia
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-60 rounded-2xl">
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Thành viên đã tham gia
            </p>
            <PeopleList people={attendance} empty="Chưa có ai điểm danh" />
          </PopoverContent>
        </Popover>
      </div>

      {/* contribute photos */}
      {canEdit && (
        <div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => e.target.files && contributePhotos(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => photoRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            Đóng góp ảnh
          </Button>
        </div>
      )}

      {/* comments */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Bình luận ({comments.length})
        </p>

        {canEdit && (
          <div className="flex items-start gap-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận để cùng sống động hơn…"
              rows={2}
              className="min-h-0 flex-1 resize-none rounded-2xl"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") postComment();
              }}
            />
            <Button
              type="button"
              size="icon"
              onClick={postComment}
              disabled={posting || !commentText.trim()}
              className="rounded-full"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => {
              const canDelete = c.user_id === user?.id || isAdmin;
              return (
                <div key={c.id} className="flex items-start gap-2">
                  <Avatar name={c.name} />
                  <div className="flex-1 rounded-2xl bg-muted/60 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => deleteComment(c.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
