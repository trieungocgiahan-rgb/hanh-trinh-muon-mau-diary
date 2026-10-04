import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import group from "@/assets/landing-group.jpg";

const steps = [
  {
    n: "1",
    title: "Đăng nhập bằng Google",
    body: "Một chạm là xong, không cần nhớ mật khẩu.",
  },
  {
    n: "2",
    title: "Chờ quản trị viên duyệt",
    body: "Tài khoản mới sẽ được duyệt để ảnh của dự án chỉ dành cho người trong đội.",
  },
  {
    n: "3",
    title: "Ghi hoạt động đầu tiên",
    body: "Bấm “Ghi hoạt động”, điền vài dòng, thêm ảnh hoặc ghi âm. Mất khoảng hai phút.",
  },
];

export function LandingSteps() {
  return (
    <section
      id="bat-dau"
      className="scroll-mt-20 bg-gradient-to-b from-background to-[var(--page-tint)] py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <img
          src={group}
          alt="Các bạn tình nguyện viên ngồi cùng nhau trong một buổi workshop"
          width={1200}
          height={912}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-2xl object-cover shadow-pop"
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Bắt đầu</p>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight sm:text-5xl">
            Dùng được ngay <em className="text-gradient font-medium">trong vài phút.</em>
          </h2>

          <ol className="mt-8 divide-y divide-border border-y border-border">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-5 py-5">
                <span className="font-display text-4xl font-semibold leading-none text-primary/80">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <Button asChild variant="hero" size="lg" className="mt-8">
            <Link to="/auth">
              Vào nhật ký
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
