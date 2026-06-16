import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SignedImage,
  SignedAudio,
  SignedVideo,
  SignedDocLink,
} from "./SignedMedia";
import { useActivityDialog } from "@/hooks/use-activity-dialog";
import { useProject } from "@/hooks/use-project";
import { useAuth } from "@/hooks/use-auth";
import { useEngagement } from "@/hooks/use-engagement";
import { ActivityEngagement } from "./ActivityEngagement";
import { supabase } from "@/integrations/supabase/client";
import { removeMedia } from "@/lib/media";
import { typeMeta, statusMeta } from "@/lib/activity-constants";
import type { AttachmentRow } from "@/lib/activity-constants";
import { toast } from "sonner";
import {
  CalendarDays,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Quote,
  ExternalLink,
  User as UserIcon,
} from "lucide-react";

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

export function ActivityDetailSheet() {
  const { detail, setDetail, openEdit } = useActivityDialog();
  const { isAdmin } = useProject();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { data: eng } = useEngagement(detail?.id);

  const a = detail;
  if (!a) return null;

  const canEdit = isAdmin || a.author_id === user?.id;
  const tm = typeMeta(a.type);
  const sm = statusMeta(a.status);

  const photos = a.attachments.filter((x) => x.kind === "photo");
  const audios = a.attachments.filter((x) => x.kind === "audio");
  const videos = a.attachments.filter((x) => x.kind === "video");
  const docs = a.attachments.filter((x) => x.kind === "document");
  const links = a.attachments.filter((x) => x.kind === "link");

  const isContributed = (x: AttachmentRow) => !!x.created_by && x.created_by !== a.author_id;
  const contributorName = (x: AttachmentRow) =>
    (x.created_by && eng?.contributorNames[x.created_by]) || "thành viên";
  const canRemoveMedia = (x: AttachmentRow) =>
    isAdmin || a.author_id === user?.id || x.created_by === user?.id;

  async function handleDelete() {
    if (!a) return;
    const paths = a.attachments.filter((x) => x.storage_path).map((x) => x.storage_path!);
    const { error } = await supabase.from("activities").delete().eq("id", a.id);
    if (error) {
      toast.error("Xóa không thành công");
      return;
    }
    if (paths.length) await Promise.all(paths.map((p) => removeMedia(p)));
    toast.success("Đã xóa hoạt động");
    qc.invalidateQueries({ queryKey: ["activities"] });
    setDetail(null);
  }

  async function removeAttachment(x: AttachmentRow) {
    if (!a) return;
    const { error } = await supabase.from("attachments").delete().eq("id", x.id);
    if (error) {
      toast.error("Không xóa được");
      return;
    }
    if (x.storage_path) await removeMedia(x.storage_path);
    toast.success("Đã xóa");
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["engagement", a.id] });
  }

  return (
    <>
      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-lg">
          <div className="h-2 w-full" style={{ backgroundColor: tm.colorVar }} />
          <SheetHeader className="px-6 pt-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                className="border-0 text-white"
                style={{ backgroundColor: tm.colorVar }}
              >
                {tm.emoji} {tm.label}
              </Badge>
              <Badge variant="secondary" className={sm.className}>
                {sm.label}
              </Badge>
            </div>
            <SheetTitle className="text-left text-2xl leading-tight">{a.title}</SheetTitle>
          </SheetHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {formatDate(a.date)}
              </span>
              {a.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {a.location}
                </span>
              )}
              {a.participant_count != null && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {a.participant_count} người
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <UserIcon className="h-4 w-4" /> {a.author_name ?? "Ẩn danh"}
              </span>
            </div>

            {a.highlight && (
              <div className="relative rounded-2xl bg-accent/60 p-4 pl-10">
                <Quote className="absolute left-3 top-3.5 h-5 w-5 text-grape" />
                <p className="text-base font-medium italic leading-relaxed text-accent-foreground">
                  {a.highlight}
                </p>
              </div>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLightbox(p.storage_path!)}
                      className="h-full w-full"
                    >
                      <SignedImage
                        path={p.storage_path!}
                        alt={p.file_name ?? "ảnh"}
                        className="h-full w-full cursor-pointer object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                    {isContributed(p) && (
                      <span className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        + {contributorName(p)}
                      </span>
                    )}
                    {canRemoveMedia(p) && (
                      <button
                        type="button"
                        onClick={() => removeAttachment(p)}
                        className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {a.summary && <Section title="Diễn biến chính">{a.summary}</Section>}
            {a.issues && <Section title="Vấn đề phát sinh">{a.issues}</Section>}
            {a.next_steps && <Section title="Bước tiếp theo">{a.next_steps}</Section>}

            {audios.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ghi âm</h4>
                {audios.map((x) => (
                  <div key={x.id} className="space-y-0.5">
                    <SignedAudio path={x.storage_path!} />
                    <MediaCredit x={x} />
                  </div>
                ))}
              </div>
            )}

            {videos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Video</h4>
                {videos.map((x) => (
                  <div key={x.id} className="space-y-0.5">
                    <SignedVideo path={x.storage_path!} />
                    <MediaCredit x={x} />
                  </div>
                ))}
              </div>
            )}

            {(docs.length > 0 || links.length > 0) && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tài liệu &amp; liên kết
                </h4>
                {docs.map((x) => (
                  <div key={x.id} className="space-y-0.5">
                    <SignedDocLink path={x.storage_path!} fileName={x.file_name} />
                    <MediaCredit x={x} />
                  </div>
                ))}
                {links.map((x) => (
                  <a
                    key={x.id}
                    href={x.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate">{x.url}</span>
                  </a>
                ))}
              </div>
            )}

            <ActivityEngagement activity={a} engagement={eng} />

            {canEdit && (
              <div className="flex gap-2 border-t pt-4">
                <Button variant="outline" className="flex-1" onClick={() => openEdit(a)}>
                  <Pencil className="h-4 w-4" /> Sửa
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" /> Xóa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa hoạt động này?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Toàn bộ ảnh, ghi âm và tài liệu đính kèm cũng sẽ bị xóa.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none">
          {lightbox && (
            <SignedImage path={lightbox} alt="ảnh" className="max-h-[85vh] w-full rounded-xl object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
