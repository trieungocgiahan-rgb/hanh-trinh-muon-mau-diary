import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowDown, Heart, Lock } from "lucide-react";
import sunset from "@/assets/landing-sunset.jpg";
import group from "@/assets/landing-group.jpg";

const timelineMock = [
  { time: "09:00", label: "Workshop kể chuyện", type: "bg-type-workshop" },
  { time: "13:30", label: "Họp đội ngũ", type: "bg-type-team" },
  { time: "16:00", label: "Thăm điểm trường", type: "bg-type-site" },
];

export function LandingHero() {
  return (
    <section className="grain relative overflow-hidden bg-mesh-warm pt-12 pb-24 sm:pt-20 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[oklch(0.80_0.14_55/0.35)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[oklch(0.78_0.14_330/0.25)] blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="text-center lg:text-left">
          <span className="surface inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-hero" aria-hidden />
            Nhật ký của dự án cộng đồng
          </span>

          <p className="mt-7 font-hand text-3xl text-primary sm:text-4xl">Hành trình</p>
          <h1 className="font-display text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient">Muôn Màu</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-muted-foreground lg:mx-0 sm:text-lg">
            Mỗi buổi workshop, mỗi chuyến đi, mỗi nụ cười — tất cả được cất giữ ở một nơi, để cả đội
            cùng nhìn lại và cùng bước tiếp.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
              <Link to="/auth">Khám phá hành trình</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href="#khoanh-khac">
                Xem khoảnh khắc mới
                <ArrowDown className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <p className="mx-auto mt-9 flex max-w-sm items-start justify-center gap-2 text-left text-sm text-muted-foreground lg:mx-0 lg:justify-start">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            Ảnh và ghi âm lưu riêng tư, chỉ thành viên dự án mới xem được.
          </p>
        </div>

        {/* Ảnh mock giao diện dòng thời gian */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="surface rotate-[1deg] rounded-xl p-4 shadow-pop">
            <div className="flex items-center gap-1.5 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-sunny" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-mint" aria-hidden />
              <p className="ml-2 text-xs font-semibold text-muted-foreground">
                Tháng 8 · Dòng thời gian
              </p>
            </div>

            <img
              src={group}
              alt="Cả đội cùng nhau sau một buổi workshop cộng đồng"
              width={1200}
              height={912}
              className="h-44 w-full rounded-lg object-cover shadow-soft"
            />

            <div className="mt-3 space-y-2.5">
              {timelineMock.map((it) => (
                <div
                  key={it.time}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-gradient-to-r from-secondary/70 to-secondary/30 px-3 py-2.5"
                >
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${it.type}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{it.label}</p>
                    <p className="text-xs text-muted-foreground">{it.time} · Nét Mơ</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3.5 w-3.5 fill-primary/80 text-primary" aria-hidden /> 12
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Polaroid dán băng keo */}
          <div className="absolute -bottom-24 -left-2 w-32 -rotate-6 rounded-md border border-border/50 bg-card p-2 pb-6 shadow-pop sm:-left-16 sm:w-44 lg:-bottom-28 lg:-left-36">
            <span
              aria-hidden
              className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-3 rounded-sm bg-sunny/60"
            />
            <img
              src={sunset}
              alt="Hoàng hôn trên bãi biển trong một chuyến đi của dự án"
              width={912}
              height={1104}
              loading="lazy"
              className="h-28 w-full rounded-sm object-cover sm:h-32"
            />
            <p className="mt-1.5 text-center font-hand text-base text-muted-foreground">
              chuyến đi tháng 7
            </p>
          </div>

          <span
            aria-hidden
            className="absolute -right-2 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-soft"
          >
            <Heart className="h-5 w-5 fill-primary text-primary" />
          </span>
        </div>
      </div>
    </section>
  );
}
