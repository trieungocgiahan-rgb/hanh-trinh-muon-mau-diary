import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttachmentManager, type PendingItem } from "./AttachmentManager";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia, removeMedia } from "@/lib/media";
import { useProject } from "@/hooks/use-project";
import { useAuth } from "@/hooks/use-auth";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import {
  ACTIVITY_TYPES,
  ACTIVITY_STATUSES,
  type ActivityType,
  type ActivityStatus,
  type AttachmentRow,
} from "@/lib/activity-constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function ActivityFormDialog() {
  const { createOpen, setCreateOpen, editing, presetDate, closeAll } = useActivityDialog();
  const { current } = useProject();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayStr());
  const [type, setType] = useState<ActivityType>("workshop");
  const [status, setStatus] = useState<ActivityStatus>("planned");
  const [location, setLocation] = useState("");
  const [participants, setParticipants] = useState("");
  const [summary, setSummary] = useState("");
  const [highlight, setHighlight] = useState("");
  const [issues, setIssues] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [existing, setExisting] = useState<AttachmentRow[]>([]);

  useEffect(() => {
    if (!createOpen) return;
    if (editing) {
      setTitle(editing.title);
      setDate(editing.date);
      setType(editing.type);
      setStatus(editing.status);
      setLocation(editing.location ?? "");
      setParticipants(editing.participant_count?.toString() ?? "");
      setSummary(editing.summary ?? "");
      setHighlight(editing.highlight ?? "");
      setIssues(editing.issues ?? "");
      setNextSteps(editing.next_steps ?? "");
      setExisting(editing.attachments);
    } else {
      setTitle("");
      setDate(presetDate ?? todayStr());
      setType("workshop");
      setStatus("planned");
      setLocation("");
      setParticipants("");
      setSummary("");
      setHighlight("");
      setIssues("");
      setNextSteps("");
      setExisting([]);
    }
    setPending([]);
  }, [createOpen, editing, presetDate]);

  async function deleteExisting(att: AttachmentRow) {
    setExisting((e) => e.filter((x) => x.id !== att.id));
    await supabase.from("attachments").delete().eq("id", att.id);
    if (att.storage_path) await removeMedia(att.storage_path);
  }

  async function uploadPending(activityId: string) {
    for (const item of pending) {
      if (item.kind === "link") {
        await supabase.from("attachments").insert({
          activity_id: activityId,
          kind: "link",
          url: item.url,
          file_name: item.name,
        });
      } else if (item.file) {
        const path = await uploadMedia(current!.id, activityId, item.file, item.name);
        await supabase.from("attachments").insert({
          activity_id: activityId,
          kind: item.kind,
          storage_path: path,
          file_name: item.name,
          mime_type: (item.file as File).type || null,
        });
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!current || !user) return;
    if (!title.trim()) {
      toast.error("Hãy nhập tên hoạt động");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        date,
        type,
        status,
        location: location.trim() || null,
        participant_count: participants ? Number(participants) : null,
        summary: summary.trim() || null,
        highlight: highlight.trim() || null,
        issues: issues.trim() || null,
        next_steps: nextSteps.trim() || null,
      };

      if (editing) {
        const { error } = await supabase.from("activities").update(payload).eq("id", editing.id);
        if (error) throw error;
        await uploadPending(editing.id);
        toast.success("Đã cập nhật hoạt động ✨");
      } else {
        const { data, error } = await supabase
          .from("activities")
          .insert({ ...payload, project_id: current.id, author_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        await uploadPending(data.id);
        toast.success("Đã ghi vào nhật ký! 🎉", { description: title.trim() });
      }
      qc.invalidateQueries({ queryKey: ["activities", current.id] });
      closeAll();
    } catch (err) {
      console.error(err);
      toast.error("Lưu không thành công", {
        description: "Bạn kiểm tra lại quyền hoặc thử lại nhé.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={createOpen} onOpenChange={(o) => (o ? setCreateOpen(true) : closeAll())}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-gradient-sun px-6 py-4">
          <DialogTitle className="text-xl text-sunny-foreground">
            {editing ? "Sửa hoạt động" : "Ghi hoạt động mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-8rem)] flex-col">
          <div className="space-y-4 overflow-y-auto px-6 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="t">Tên hoạt động *</Label>
              <Input
                id="t"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Workshop vẽ tranh cùng các bé"
                maxLength={200}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="d">Ngày *</Label>
                <Input id="d" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p">Số người tham gia</Label>
                <Input
                  id="p"
                  type="number"
                  min={0}
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Loại hoạt động</Label>
                <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.emoji} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ActivityStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc">Địa điểm</Label>
              <Input
                id="loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Mái ấm Hoa Hồng, Q.3"
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sum">Diễn biến chính</Label>
              <Textarea
                id="sum"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Kể lại điều đã diễn ra…"
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hl">Quote / Điểm nổi bật</Label>
              <Textarea
                id="hl"
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                placeholder='VD: "Con thích được vẽ ước mơ của mình!"'
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="is">Vấn đề phát sinh</Label>
                <Textarea id="is" value={issues} onChange={(e) => setIssues(e.target.value)} rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ns">Bước tiếp theo</Label>
                <Textarea id="ns" value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} rows={3} />
              </div>
            </div>

            <div className="space-y-2 rounded-2xl bg-muted/40 p-4">
              <Label className="text-sm font-semibold">Tệp đính kèm</Label>
              <AttachmentManager
                pending={pending}
                setPending={setPending}
                existing={existing}
                onDeleteExisting={deleteExisting}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t bg-card px-6 py-4">
            <Button type="button" variant="ghost" onClick={closeAll}>
              Hủy
            </Button>
            <Button type="submit" variant="hero" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Lưu thay đổi" : "Ghi vào nhật ký"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
