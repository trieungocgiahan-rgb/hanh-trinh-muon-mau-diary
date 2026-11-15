import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiaryFallback } from "@/components/illustrations/Fallbacks";
import { SlotImage } from "@/components/illustrations/SlotImage";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");

const BARS = [5, 11, 7, 15, 9, 17, 6, 12, 8, 14, 5, 10];

// Ba mục nhật ký mẫu từ ba nơi khác nhau, cùng đổ về một trang.
function Feed() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-full max-w-md">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("feed.sample")}
        <span className="h-px flex-1 bg-border" />
      </p>

      <ul className="space-y-3">
        <li className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-cool px-2.5 py-0.5 font-semibold text-cool-ink">
              {t("feed.e1.city")}
            </span>
            <span className="text-muted-foreground">{t("feed.e1.time")}</span>
            <Camera className="ml-auto h-4 w-4 text-primary-ink" aria-hidden />
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{t("feed.e1.text")}</p>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-10 flex-1 rounded-lg bg-secondary"
                style={{ opacity: 1 - i * 0.18 }}
              />
            ))}
          </div>
        </li>

        <li className="glass ml-6 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-cool px-2.5 py-0.5 font-semibold text-cool-ink">
              {t("feed.e2.city")}
            </span>
            <span className="text-muted-foreground">{t("feed.e2.time")}</span>
            <Mic className="ml-auto h-4 w-4 text-primary-ink" aria-hidden />
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{t("feed.e2.text")}</p>
          <div className="mt-3 flex h-6 items-center gap-[3px]" aria-hidden>
            {BARS.map((h, i) => (
              <span key={i} className="w-[3px] rounded-full bg-primary" style={{ height: h + 4 }} />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">0:42</span>
          </div>
        </li>

        <li className="glass glow-pink mr-6 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-cool px-2.5 py-0.5 font-semibold text-cool-ink">
              {t("feed.e3.city")}
            </span>
            <span className="text-muted-foreground">{t("feed.e3.time")}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{t("feed.e3.text")}</p>
        </li>
      </ul>

      {/* hình cuốn nhật ký thò ra phía dưới (ảnh thật nếu đã có) */}
      <div className="pointer-events-none absolute -bottom-16 -right-2 w-32 sm:-right-8 sm:w-40">
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
      <span aria-hidden className="orb bottom-0 right-1/3 h-72 w-72" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div>
          <h1 className="text-balance font-display text-[2.8rem] font-extrabold leading-[1.03] tracking-tight text-foreground sm:text-5xl lg:text-[3.6rem]">
            {t("hero.l1")}
            <br />
            <span className="text-primary text-glow">{nb(t("hero.l2"))}</span>
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
