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
import { useI18n, type Key } from "@/lib/i18n";

type Mode = "choose" | "join" | "create";

function friendlyError(t: (key: Key) => string, message: string | undefined, fallback: string) {
  const m = message ?? "";
  if (m.includes("invalid_code")) return t("onb.invalidCode");
  if (m.includes("too_many_projects")) return t("onb.tooMany");
  if (m.includes("invalid_name")) return t("onb.invalidName");
  if (m.includes("Could not find the function") || m.includes("PGRST202")) return t("onb.notReady");
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
  const { t } = useI18n();
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
      toast.error(friendlyError(t, error.message, t("onb.joinFail")));
      return;
    }
    await qc.invalidateQueries({ queryKey: ["my-projects"] });
    if (data === "pending") {
      toast.success(t("onb.requestSent"), {
        description: t("onb.requestSentDesc"),
      });
    } else {
      toast.success(t("onb.alreadyIn"));
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
      toast.error(friendlyError(t, error?.message, t("onb.createFail")));
      return;
    }
    await qc.invalidateQueries({ queryKey: ["my-projects"] });
    setCurrentId(data);
    toast.success(t("onb.created"), {
      description: t("onb.createdDesc"),
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
          <span className="mt-4 font-display text-xl font-semibold">{t("onb.joinTitle")}</span>
          <span className="mt-1 text-sm text-muted-foreground">{t("onb.joinBody")}</span>
          <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
            {t("onb.enterCode")}{" "}
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
          <span className="mt-4 font-display text-xl font-semibold">{t("onb.createTitle")}</span>
          <span className="mt-1 text-sm text-muted-foreground">{t("onb.createBody")}</span>
          <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
            {t("onb.start")}{" "}
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
      <ArrowLeft className="h-4 w-4" /> {t("common.back")}
    </button>
  );

  if (mode === "join") {
    return (
      <form onSubmit={join} className="surface rounded-2xl p-5 sm:p-6">
        {back}
        <h2 className="font-display text-2xl font-semibold">{t("onb.codeTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("onb.codeHelp", { example: "K7QM-4XNP" })}
        </p>
        <Label htmlFor="code" className="sr-only">
          {t("members.code")}
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
          {t("onb.join")}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("onb.approvalNote")}</p>
      </form>
    );
  }

  return (
    <form onSubmit={create} className="surface rounded-2xl p-5 sm:p-6">
      {back}
      <h2 className="font-display text-2xl font-semibold">{t("onb.createTitle")}</h2>
      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pn">{t("settings.name")}</Label>
          <Input
            id="pn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("onb.namePh")}
            maxLength={120}
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="on">{t("onb.org")}</Label>
          <Input
            id="on"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder={t("onb.orgPh")}
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pd">{t("settings.description")}</Label>
          <Textarea
            id="pd"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("onb.descPh")}
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
        {t("onb.create")}
      </Button>
    </form>
  );
}
