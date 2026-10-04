import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/use-project";
import { useProjectBranding } from "@/hooks/use-project-branding";
import { PROJECT_THEMES, applyThemeVars } from "@/lib/project-themes";
import { downscaleImage } from "@/lib/image";
import { removeMedia } from "@/lib/media";
import { PageHeader } from "@/components/PageHeader";
import { SignedImage } from "@/components/activity/SignedMedia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/cai-dat")({
  head: () => ({ meta: [{ title: "Cài đặt dự án — Nhật Ký Hành Trình" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { current, isAdmin } = useProject();
  const branding = useProjectBranding(current?.id);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("coral");
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [pendingCover, setPendingCover] = useState<{ blob: Blob; preview: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // nạp giá trị hiện tại một lần cho mỗi dự án
  useEffect(() => {
    if (!current) return;
    setName(current.name);
    setDescription(current.description ?? "");
    setTheme(branding.theme);
    setCoverPath(branding.coverPath);
    setPendingCover(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, branding.theme, branding.coverPath]);

  // xem trước màu ngay khi chọn; trả về màu đã lưu khi rời trang
  useEffect(() => {
    applyThemeVars(theme);
    return () => applyThemeVars(branding.theme);
  }, [theme, branding.theme]);

  if (!current) return null;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-muted-foreground">Chỉ quản trị viên mới chỉnh được cài đặt dự án.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/lich">Về lịch</Link>
        </Button>
      </div>
    );
  }

  async function pickCover(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    try {
      const blob = await downscaleImage(file);
      setPendingCover({ blob, preview: URL.createObjectURL(blob) });
    } catch {
      toast.error("Không đọc được ảnh này");
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!current || !name.trim()) return;
    setSaving(true);
    try {
      let nextCover = coverPath;
      if (pendingCover) {
        const path = `${current.id}/cover/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, pendingCover.blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        nextCover = path;
      }
      const { error } = await supabase
        .from("projects")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          theme,
          cover_path: nextCover,
        })
        .eq("id", current.id);
      if (error) throw error;
      if (branding.coverPath && branding.coverPath !== nextCover) {
        await removeMedia(branding.coverPath);
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["my-projects"] }),
        qc.invalidateQueries({ queryKey: ["branding", current.id] }),
      ]);
      setPendingCover(null);
      toast.success("Đã lưu cài đặt dự án");
    } catch (err) {
      console.error(err);
      toast.error("Chưa lưu được", {
        description: "Nếu lỗi lặp lại, có thể máy chủ chưa cập nhật phần cài đặt mới.",
      });
    } finally {
      setSaving(false);
    }
  }

  const coverShown = pendingCover?.preview ?? null;

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Quản trị"
        title="Cài đặt dự án"
        description="Làm cho nhật ký mang dấu ấn riêng của dự án này."
      />

      <section className="surface space-y-4 rounded-2xl p-5 sm:p-6">
        <div className="space-y-1.5">
          <Label htmlFor="n">Tên dự án *</Label>
          <Input
            id="n"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="d">Mô tả ngắn</Label>
          <Textarea
            id="d"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Hiện dưới tên dự án trên banner."
          />
        </div>
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold">Màu chủ đạo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Đổi màu nút, tiêu đề nổi bật và nền toàn bộ giao diện của dự án. Bạn thấy kết quả ngay.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PROJECT_THEMES.map((t) => {
            const selected = theme === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.key)}
                aria-pressed={selected}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-btn"
                  style={{
                    backgroundImage: `linear-gradient(135deg, oklch(0.78 0.15 ${t.hue + 34}), oklch(0.62 0.19 ${"h2" in t ? t.h2 : t.hue - 76}))`,
                  }}
                >
                  {selected && <Check className="h-4 w-4" />}
                </span>
                <span className="text-sm font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold">Ảnh bìa</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hiện ở đầu trang Lịch và trên báo cáo PDF. Nên dùng ảnh ngang, sáng và rõ.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            pickCover(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-muted/40">
          {coverShown || coverPath ? (
            <div className="relative aspect-[16/6]">
              {coverShown ? (
                <img src={coverShown} alt="Ảnh bìa mới" className="h-full w-full object-cover" />
              ) : (
                <SignedImage
                  path={coverPath!}
                  alt="Ảnh bìa"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[16/6] w-full flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-primary"
            >
              <ImagePlus className="h-7 w-7" />
              <span className="text-sm font-medium">Chọn ảnh bìa</span>
            </button>
          )}
        </div>
        {(coverShown || coverPath) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" /> Đổi ảnh
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => {
                setPendingCover(null);
                setCoverPath(null);
              }}
            >
              <Trash2 className="h-4 w-4" /> Bỏ ảnh bìa
            </Button>
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <Button type="submit" variant="hero" size="lg" disabled={saving || !name.trim()}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Lưu cài đặt
        </Button>
      </div>
    </form>
  );
}
