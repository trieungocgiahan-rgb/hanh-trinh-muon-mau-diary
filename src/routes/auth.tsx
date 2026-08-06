import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — Nhật Ký Hành Trình" },
      {
        name: "description",
        content: "Đăng nhập bằng Google để ghi lại hành trình dự án cộng đồng cùng cả đội.",
      },
      { property: "og:title", content: "Đăng nhập — Nhật Ký Hành Trình" },
      {
        property: "og:description",
        content: "Đăng nhập bằng Google để ghi lại hành trình dự án cộng đồng cùng cả đội.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
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
      toast.error("Không thể đăng nhập với Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/lich" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-cream px-4 py-10">
      <div className="w-full max-w-md animate-pop-in rounded-3xl bg-card p-7 text-center shadow-pop sm:p-9">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-sun text-3xl shadow-soft">
          🧭
        </div>
        <p className="font-hand text-2xl text-primary">Chào bạn trở lại</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-foreground">
          Nhật Ký Hành Trình
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          Đăng nhập hoặc tạo tài khoản chỉ bằng một bước với Google.
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
          Tiếp tục với Google
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          Tài khoản mới sẽ ở trạng thái chờ quản trị viên hoặc thành viên duyệt.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang giới thiệu
        </Link>
      </div>
    </div>
  );
}
