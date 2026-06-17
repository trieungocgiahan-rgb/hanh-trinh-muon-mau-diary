import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — Nhật Ký Hành Trình" },
      { name: "description", content: "Đăng nhập để ghi lại hành trình dự án cộng đồng." },
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

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPass,
    });
    setBusy(false);
    if (error) {
      toast.error("Đăng nhập thất bại", { description: "Email hoặc mật khẩu chưa đúng." });
      return;
    }
    toast.success("Chào mừng trở lại! 🎉");
    navigate({ to: "/lich" });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPass,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name.trim() },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Đăng ký thất bại", { description: error.message });
      return;
    }
    toast.success("Tạo tài khoản thành công! 🌱", {
      description: "Tài khoản của bạn đang chờ quản trị viên duyệt.",
    });
    navigate({ to: "/lich" });
  }

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-10">
      <div className="w-full max-w-md animate-pop-in rounded-3xl bg-card p-6 shadow-pop sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-sun text-3xl shadow-soft">
            🧭
          </div>
          <h1 className="text-2xl font-bold text-foreground">Nhật Ký Hành Trình</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ghi lại từng dấu chân của dự án cùng cả đội
          </p>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 rounded-full">
            <TabsTrigger value="login" className="rounded-full">
              Đăng nhập
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full">
              Đăng ký
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="le">Email</Label>
                <Input
                  id="le"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ban@vidu.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lp">Mật khẩu</Label>
                <Input
                  id="lp"
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Đăng nhập"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="sn">Họ và tên</Label>
                <Input
                  id="sn"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="se">Email</Label>
                <Input
                  id="se"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="ban@vidu.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp">Mật khẩu</Label>
                <Input
                  id="sp"
                  type="password"
                  required
                  minLength={6}
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tạo tài khoản"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">hoặc</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full"
          onClick={handleGoogle}
          disabled={busy}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
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
          Tiếp tục với Google
        </Button>
      </div>
    </div>
  );
}
