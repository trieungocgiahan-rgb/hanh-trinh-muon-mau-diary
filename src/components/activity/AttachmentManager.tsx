import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceRecorder, PendingAudioPreview } from "./VoiceRecorder";
import { SignedImage, SignedAudio, SignedVideo, SignedDocLink } from "./SignedMedia";
import type { AttachmentKind, AttachmentRow } from "@/lib/activity-constants";
import { ImagePlus, Video, FileUp, LinkIcon, Trash2, Plus, ExternalLink } from "lucide-react";

export interface PendingItem {
  id: string;
  kind: AttachmentKind;
  name: string;
  file?: File | Blob;
  url?: string;
}

interface Props {
  pending: PendingItem[];
  setPending: React.Dispatch<React.SetStateAction<PendingItem[]>>;
  existing?: AttachmentRow[];
  onDeleteExisting?: (att: AttachmentRow) => void;
}

export function AttachmentManager({ pending, setPending, existing = [], onDeleteExisting }: Props) {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function addFiles(files: FileList | File[], kind: AttachmentKind) {
    const items = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      kind,
      name: f.name,
      file: f,
    }));
    setPending((p) => [...p, ...items]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const imgs = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (imgs.length) addFiles(imgs, "photo");
  }

  function addLink() {
    const u = linkUrl.trim();
    if (!u) return;
    let safe = u;
    if (!/^https?:\/\//i.test(safe)) safe = "https://" + safe;
    setPending((p) => [...p, { id: crypto.randomUUID(), kind: "link", name: safe, url: safe }]);
    setLinkUrl("");
  }

  const pendingPhotos = pending.filter((p) => p.kind === "photo");
  const pendingOther = pending.filter((p) => p.kind !== "photo");
  const existingPhotos = existing.filter((a) => a.kind === "photo");
  const existingOther = existing.filter((a) => a.kind !== "photo");

  return (
    <div className="space-y-4">
      {/* hidden inputs */}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => e.target.files && addFiles(e.target.files, "photo")}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        multiple
        hidden
        onChange={(e) => e.target.files && addFiles(e.target.files, "video")}
      />
      <input
        ref={docRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        hidden
        onChange={(e) => e.target.files && addFiles(e.target.files, "document")}
      />
      <input
        ref={audioRef}
        type="file"
        accept="audio/*"
        multiple
        hidden
        onChange={(e) => e.target.files && addFiles(e.target.files, "audio")}
      />

      {/* photo dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => photoRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/40 hover:bg-muted"
        }`}
      >
        <ImagePlus className="mb-2 h-7 w-7 text-primary" />
        <p className="text-sm font-medium">Kéo thả hoặc bấm để thêm ảnh</p>
        <p className="text-xs text-muted-foreground">Có thể chọn nhiều ảnh cùng lúc</p>
      </div>

      {/* photo previews */}
      {(existingPhotos.length > 0 || pendingPhotos.length > 0) && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {existingPhotos.map((a) => (
            <div key={a.id} className="group relative aspect-square overflow-hidden rounded-xl">
              <SignedImage
                path={a.storage_path!}
                alt={a.file_name ?? "ảnh"}
                className="h-full w-full object-cover"
              />
              {onDeleteExisting && (
                <button
                  type="button"
                  onClick={() => onDeleteExisting(a)}
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {pendingPhotos.map((p) => (
            <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl">
              <img
                src={URL.createObjectURL(p.file as Blob)}
                alt={p.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPending((prev) => prev.filter((x) => x.id !== p.id))}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* quick action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => videoRef.current?.click()}>
          <Video className="h-4 w-4" /> Video
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => docRef.current?.click()}>
          <FileUp className="h-4 w-4" /> Tài liệu
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => audioRef.current?.click()}>
          <Plus className="h-4 w-4" /> Tải ghi âm
        </Button>
        <VoiceRecorder
          onRecorded={(blob) =>
            setPending((p) => [
              ...p,
              {
                id: crypto.randomUUID(),
                kind: "audio",
                name: `ghi-am-${Date.now()}.webm`,
                file: blob,
              },
            ])
          }
        />
      </div>

      {/* link adder */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs">
          <LinkIcon className="h-3.5 w-3.5" /> Liên kết ngoài (Google Drive, v.v.)
        </Label>
        <div className="flex gap-2">
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLink();
              }
            }}
            placeholder="https://..."
          />
          <Button type="button" variant="secondary" size="sm" onClick={addLink}>
            Thêm
          </Button>
        </div>
      </div>

      {/* non-photo previews */}
      {(existingOther.length > 0 || pendingOther.length > 0) && (
        <div className="space-y-2">
          {existingOther.map((a) => (
            <div key={a.id} className="flex items-center gap-2">
              <div className="flex-1">
                {a.kind === "audio" && <SignedAudio path={a.storage_path!} />}
                {a.kind === "video" && <SignedVideo path={a.storage_path!} />}
                {a.kind === "document" && (
                  <SignedDocLink path={a.storage_path!} fileName={a.file_name} />
                )}
                {a.kind === "link" && (
                  <a
                    href={a.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate">{a.url}</span>
                  </a>
                )}
              </div>
              {onDeleteExisting && (
                <button
                  type="button"
                  onClick={() => onDeleteExisting(a)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {pendingOther.map((p) =>
            p.kind === "audio" ? (
              <PendingAudioPreview
                key={p.id}
                blob={p.file as Blob}
                onRemove={() => setPending((prev) => prev.filter((x) => x.id !== p.id))}
              />
            ) : (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm"
              >
                {p.kind === "link" ? (
                  <ExternalLink className="h-4 w-4 text-primary" />
                ) : p.kind === "video" ? (
                  <Video className="h-4 w-4 text-primary" />
                ) : (
                  <FileUp className="h-4 w-4 text-primary" />
                )}
                <span className="flex-1 truncate">{p.name}</span>
                <button
                  type="button"
                  onClick={() => setPending((prev) => prev.filter((x) => x.id !== p.id))}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
