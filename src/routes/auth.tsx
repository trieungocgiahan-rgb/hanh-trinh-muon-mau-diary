import { ThemeToggle } from "@/components/ThemeToggle";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { BRAND } from "@/lib/brand";
import { useI18n, tNow } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `${tNow("common.signIn")} — ${BRAND}` },
      { name: "description", content: tNow("auth.desc") },
      { property: "og:title", content: `${tNow("common.signIn")} — ${BRAND}` },
      { property: "og:description", content: tNow("auth.desc") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/lich" });
  }, [session, loading, navigate]);

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error(t("auth.error"));
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/lich" });
  }

  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh-warm px-4 py-10">
      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="surface relative w-full max-w-md animate-pop-in rounded-2xl p-7 text-center shadow-pop sm:p-9">
        <img
          src={logoAsset.url}
          alt={BRAND}
          className="mx-auto mb-5 h-16 w-16 rounded-xl object-cover shadow-pop ring-4 ring-card"
        />
        <p className="font-display text-lg font-medium italic text-primary">{t("auth.welcomeBack")}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
          {BRAND}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          {t("auth.intro")}
        </p>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-7 w-full rounded-full"
          onClick={handleGoogle}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
              />
            </svg>
          )}
          {t("auth.google")}
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          {t("auth.pendingNote")}
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.backToLanding")}
        </Link>
      </div>
    </div>
  );
}
