import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="px-5 pb-20 sm:pb-28">
      <div className="grain relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-hero px-6 py-16 text-center shadow-pop sm:py-20">
        <div className="relative">
          <h2 className="font-display text-3xl font-semibold leading-tight text-primary-foreground sm:text-5xl">
            Đừng để khoảnh khắc <em className="font-medium">trôi mất.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-primary-foreground/85">
            Ghi lại ngay hôm nay, để cả đội cùng nhìn lại vào ngày mai.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-none bg-[oklch(0.99_0.01_80)] text-[oklch(0.3_0.05_30)] shadow-pop hover:bg-[oklch(0.97_0.015_80)]"
          >
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
