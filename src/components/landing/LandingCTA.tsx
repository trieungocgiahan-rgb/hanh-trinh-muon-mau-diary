import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="px-5 py-16">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-hero px-6 py-14 text-center shadow-pop">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-primary-foreground/10"
        />
        <p className="font-hand text-2xl text-primary-foreground/90">
          Mỗi khoảnh khắc đều đáng giá
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-primary-foreground sm:text-4xl">
          Cùng viết tiếp hành trình
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/85">
          Đăng nhập bằng Google để xem nhật ký của dự án và thêm khoảnh khắc của riêng bạn.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-7 rounded-full bg-card text-foreground hover:bg-card/90"
        >
          <Link to="/auth">Tham gia hành trình</Link>
        </Button>
      </div>
    </section>
  );
}
