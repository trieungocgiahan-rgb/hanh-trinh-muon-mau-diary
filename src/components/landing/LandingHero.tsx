import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiaryFallback } from "@/components/illustrations/Fallbacks";
import { SlotImage } from "@/components/illustrations/SlotImage";
import { useI18n, type Key } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

const BARS = [5, 11, 7, 15, 9, 17, 6, 12, 8, 14, 5, 10];

// Ba mục nhật ký mẫu từ ba nơi khác nhau, nối vào cùng một sợi chỉ.
const ENTRIES = [
  { key: "e1", chip: "bg-azure text-white", dot: "bg-azure" },
  { key: "e2", chip: "bg-amber text-[oklch(0.3_0.06_80)]", dot: "bg-amber" },
  { key: "e3", chip: "bg-tang text-[oklch(0.3_0.07_45)]", dot: "bg-tang" },
] as const;

function Feed() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-full max-w-md">
      <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("feed.sample")}
        <span className="h-px flex-1 bg-border" />
      </p>

      <div className="relative pl-9">
        {/* hai lớp màu đặc phía sau, nghiêng nhẹ như giấy dán */}
        <span aria-hidden className="absolute -right-3 top-10 h-[80%] w-[84%] rotate-[4deg] rounded-[2rem] bg-amber" />
        <span aria-hidden className="absolute left-2 top-14 h-[72%] w-[80%] -rotate-[4deg] rounded-[2rem] bg-azure" />
        {/* sợi chỉ nối các mục, có hạt chạy dọc */}
        <span aria-hidden className="thread-v absolute bottom-3 left-[11px] top-3 w-[2px]" />
        <span
          aria-hidden
          className="animate-packet absolute left-[6px] h-[10px] w-[10px] rounded-full bg-primary shadow-[0_0_12px_var(--glow)]"
          style={{ top: 12 }}
        />

        <ul className="relative space-y-3">
          {ENTRIES.map((e, i) => (
            <li
              key={e.key}
              className={`animate-arrive relative rounded-2xl border border-white/80 bg-card p-4 shadow-pop transition-transform duration-200 hover:-translate-y-0.5 hover:rotate-[-0.4deg] ${e.key === "e3" ? "sm:pr-24" : ""}`}
              style={{ "--d": `${250 + i * 220}ms` } as React.CSSProperties}
            >
              {/* nút nối trên sợi chỉ, nhấp nháy nhẹ */}
              <span aria-hidden className="absolute -left-[34px] top-5 flex h-3 w-3">
                <span className={`animate-ping-soft absolute inline-flex h-full w-full rounded-full ${e.dot}`} style={{ animationDelay: `${i * 0.6}s` }} />
                <span className={`relative inline-flex h-3 w-3 rounded-full ring-2 ring-card ${e.dot}`} />
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className={`rounded-full px-2.5 py-0.5 font-semibold ${e.chip}`}>
                  {t(`feed.${e.key}.city` as Key)}
                </span>
                <span className="text-muted-foreground">{t(`feed.${e.key}.time` as Key)}</span>
                {e.key === "e1" && <Camera className="ml-auto h-4 w-4 text-primary-ink" aria-hidden />}
                {e.key === "e2" && <Mic className="ml-auto h-4 w-4 text-primary-ink" aria-hidden />}
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">{t(`feed.${e.key}.text` as Key)}</p>
              {e.key === "e1" && (
                <div className="mt-3 flex gap-1.5" aria-hidden>
                  {["bg-primary/70", "bg-azure", "bg-amber", "bg-tang"].map((c, k) => (
                    <span key={k} className={`h-10 flex-1 rounded-lg ${c}`} />
                  ))}
                </div>
              )}
              {e.key === "e2" && (
                <div className="mt-3 flex h-6 items-center gap-[3px]" aria-hidden>
                  {BARS.map((h, k) => (
                    <span key={k} className="w-[3px] rounded-full bg-primary" style={{ height: h + 4 }} />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">0:42</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* hình cuốn nhật ký thò ra phía dưới (ảnh thật nếu đã có) */}
      <div className="pointer-events-none absolute -bottom-20 -right-2 w-28 sm:-right-6 sm:w-36">
        <SlotImage
          src="/images/diary-hero.png"
          alt=""
          fallback={<DiaryFallback className="w-full" />}
          className="w-full object-contain drop-shadow-[0_18px_30px_var(--glow)]"
        />
      </div>
    </div>
  );
}

export function LandingHero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-[var(--page-tint)] pb-24 pt-28 sm:pb-32 sm:pt-36">
      <span aria-hidden className="orb -left-24 top-10 h-72 w-72" />
      <span aria-hidden className="orb-cool -right-24 top-20 h-96 w-96" />
      <span aria-hidden className="orb-amber bottom-0 right-1/4 h-72 w-72" />
      <span aria-hidden className="orb-tang left-1/3 top-1/2 h-60 w-60" />
      <span aria-hidden className="orb bottom-0 right-1/3 h-72 w-72" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="min-w-0">
          <h1 className="text-balance font-display text-[2.5rem] font-extrabold leading-[1.03] tracking-tight text-foreground sm:text-5xl lg:text-[3.6rem]">
            {t("hero.l1")}
            <br />
            <span className="text-primary">{t("hero.l2")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t("hero.sub")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/auth">
                {t("hero.primary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="glass w-full border-0 sm:w-auto">
              <a href="#dung-thu">{t("hero.secondary")}</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t("hero.note")}</p>
        </div>

        <Feed />
      </div>
    </section>
  );
}
