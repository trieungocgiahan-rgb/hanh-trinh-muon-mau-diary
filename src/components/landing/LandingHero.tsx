import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowDown, Heart, Sparkles } from "lucide-react";
import sunset from "@/assets/landing-sunset.jpg";
import group from "@/assets/landing-group.jpg";

const timelineMock = [
  { time: "09:00", label: "Workshop kể chuyện", type: "bg-type-workshop" },
  { time: "13:30", label: "Họp đội ngũ", type: "bg-type-team" },
  { time: "16:00", label: "Thăm điểm trường", type: "bg-type-site" },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-cream pt-12 pb-24 sm:pt-20 sm:pb-32">
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/85 px-4 py-2 text-xs font-bold text-primary shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Nhật ký của dự án cộng đồng
          </span>

          <p className="mt-7 font-hand text-3xl text-primary sm:text-4xl">Hành trình</p>
          <h1 className="font-display text-5xl leading-[1.02] font-extrabold text-foreground sm:text-6xl lg:text-7xl">
            Muôn Màu
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-muted-foreground lg:mx-0 sm:text-lg">
            Mỗi buổi workshop, mỗi chuyến đi, mỗi nụ cười — tất cả được cất giữ ở một
            nơi, để cả đội cùng nhìn lại và cùng bước tiếp.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
              <Link to="/auth">Khám phá hành trình</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
               className="w-full border-border/80 bg-card/90 sm:w-auto"
            >
              <a href="#khoanh-khac">
                Xem khoảnh khắc mới
                <ArrowDown className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="mt-9 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-2">
              {["bg-type-workshop", "bg-type-team", "bg-type-partner", "bg-sunny"].map((c) => (
                <span
                  key={c}
                  className={`h-8 w-8 rounded-full border-2 border-card ${c}`}
                  aria-hidden
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">150+</span> người bạn thường
              xuyên ghé lại
            </p>
          </div>
        </div>

        {/* Ảnh mock giao diện dòng thời gian */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="rotate-[1deg] rounded-lg border border-border/70 bg-gradient-paper p-4 shadow-pop">
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
              className="h-44 w-full rounded-md object-cover"
            />

            <div className="mt-3 space-y-2.5">
              {timelineMock.map((it) => (
                <div
                  key={it.time}
                  className="flex items-center gap-3 rounded-md border border-border/50 bg-secondary/55 px-3 py-2.5"
                >
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${it.type}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{it.label}</p>
                    <p className="text-xs text-muted-foreground">{it.time} · Nét Mơ</p>
                  </div>
                  <span className="text-xs text-muted-foreground">❤️ 12</span>
                </div>
              ))}
            </div>
          </div>

          {/* Polaroid dán băng keo */}
          <div className="absolute -bottom-16 -left-4 w-36 -rotate-6 rounded-md bg-card p-2 pb-6 shadow-pop sm:-left-16 sm:w-44 lg:-bottom-28 lg:-left-36">
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
