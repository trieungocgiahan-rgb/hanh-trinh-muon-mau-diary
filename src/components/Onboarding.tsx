import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/use-project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Mode = "choose" | "join" | "create";

function friendlyError(message: string | undefined, fallback: string) {
  const m = message ?? "";
  if (m.includes("invalid_code")) return "Mã chưa đúng. Bạn kiểm tra lại với quản trị viên nhé.";
  if (m.includes("too_many_projects")) return "Bạn đã tạo tối đa 5 dự án.";
  if (m.includes("invalid_name")) return "Tên quá ngắn hoặc quá dài.";
  if (m.includes("Could not find the function") || m.includes("PGRST202"))
    return "Chức năng này chưa được bật trên máy chủ. Bạn báo người quản lý hệ thống nhé.";
  return fallback;
}

// Chuẩn hóa những gì người dùng gõ/dán: chỉ giữ chữ và số, in hoa, tối đa 8 ký tự
function normalizeCode(raw: string) {
  return raw
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);
}

export function formatCode(code: string) {
  return code.length > 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

export function OnboardingPanel({ onDone }: { onDone?: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { setCurrentId } = useProject();
  const [mode, setMode] = useState<Mode>("choose");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function join(e: FormEvent) {
    e.preventDefault();
    if (code.length < 8) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("join_project_by_code", { _code: code });
    setBusy(false);
    if (error) {
      toast.error(friendlyError(error.message, "Chưa tham gia được. Bạn thử lại nhé."));
      return;
    }
    await qc.invalidateQueries({ queryKey: ["my-projects"] });
    if (data === "pending") {
      toast.success("Đã gửi yêu cầu tham gia", {
        description: "Quản trị viên duyệt xong là bạn vào được ngay.",
      });
    } else {
      toast.success("Bạn đã ở trong dự án này rồi");
    }
    onDone?.();
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("create_project_with_org", {
      _org_name: orgName,
      _name: name,
      _description: description,
    });
    setBusy(false);
    if (error || !data) {
      toast.error(friendlyError(error?.message, "Chưa tạo được dự án. Bạn thử lại nhé."));
      return;
    }
    await qc.invalidateQueries({ queryKey: ["my-projects"] });
    setCurrentId(data);
    toast.success("Đã tạo dự án", {
      description: "Bạn là quản trị viên. Mời đồng đội bằng mã dự án.",
    });
    onDone?.();
    navigate({ to: "/lich" });
  }

  if (mode === "choose") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("join")}
          className="surface surface-lift group flex flex-col rounded-2xl p-5 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-grape text-grape-foreground shadow-btn">
            <KeyRound className="h-5 w-5" />
          </span>
          <span className="mt-4 font-display text-xl font-semibold">Tham gia dự án có sẵn</span>
          <span className="mt-1 text-sm text-muted-foreground">
            Đội của bạn đã có nhật ký rồi. Nhập mã dự án do quản trị viên gửi.
          </span>
          <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
            Nhập mã{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("create")}
          className="surface surface-lift group flex flex-col rounded-2xl p-5 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-btn">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="mt-4 font-display text-xl font-semibold">Tạo dự án mới</span>
          <span className="mt-1 text-sm text-muted-foreground">
            Bắt đầu một nhật ký mới. Bạn là quản trị viên và mời đồng đội sau.
          </span>
          <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
            Bắt đầu{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </div>
    );
  }

  const back = (
    <button
      type="button"
      onClick={() => setMode("choose")}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" /> Quay lại
    </button>
  );

  if (mode === "join") {
    return (
      <form onSubmit={join} className="surface rounded-2xl p-5 sm:p-6">
        {back}
        <h2 className="font-display text-2xl font-semibold">Nhập mã dự án</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mã gồm 8 ký tự, ví dụ <span className="font-mono">K7QM-4XNP</span>. Quản trị viên xem mã ở
          trang Thành viên.
        </p>
        <Label htmlFor="code" className="sr-only">
          Mã dự án
        </Label>
        <Input
          id="code"
          value={formatCode(code)}
          onChange={(e) => setCode(normalizeCode(e.target.value))}
          placeholder="XXXX-XXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          autoFocus
          className="mt-5 h-14 text-center font-mono text-2xl font-semibold tracking-[0.25em] md:h-14 md:text-2xl"
        />
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="mt-4 w-full"
          disabled={busy || code.length < 8}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Tham gia dự án
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Ảnh của dự án chỉ dành cho người trong đội, nên quản trị viên sẽ duyệt yêu cầu của bạn.
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={create} className="surface rounded-2xl p-5 sm:p-6">
      {back}
      <h2 className="font-display text-2xl font-semibold">Tạo dự án mới</h2>
      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pn">Tên dự án *</Label>
          <Input
            id="pn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Mùa hè xanh 2026"
            maxLength={120}
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="on">Tên tổ chức</Label>
          <Input
            id="on"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Bỏ trống nếu giống tên dự án"
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pd">Mô tả ngắn</Label>
          <Textarea
            id="pd"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Dự án làm gì, cho ai?"
          />
        </div>
      </div>
      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="mt-5 w-full"
        disabled={busy || !name.trim()}
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Tạo dự án
      </Button>
    </form>
  );
}
