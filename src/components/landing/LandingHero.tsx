import { useState } from "react";
import { ArrowRight, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiaryFallback } from "@/components/illustrations/Fallbacks";
import { SlotImage } from "@/components/illustrations/SlotImage";
import { useI18n } from "@/lib/i18n";
import { DEMO_ADD_EVENT } from "./demo/demo-data";

const nb = (s: string) => s.replace(/ (\S+)$/, " $1");
const CHIPS = ["hero.chip1", "hero.chip2", "hero.chip3"] as const;
const CHECKS = ["hero.check1", "hero.check2", "hero.check3"] as const;

export function LandingHero() {
  const { t } = useI18n();
  const [title, setTitle] = useState("");

  // Ghi thử: chuyển xuống phần dùng thử và thêm hoạt động vào lịch mẫu
  function tryLog(value: string) {
    const v = value.trim();
    if (!v) return;
    window.dispatchEvent(new CustomEvent(DEMO_ADD_EVENT, { detail: { title: v } }));
    document.getElementById("dung-thu")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTitle("");
  }

  return (
    <section className="relative overflow-hidden bg-[var(--page-tint)] pb-24 pt-28 sm:pb-32 sm:pt-36">
      {/* quầng sáng hồng */}
      <span aria-hidden className="orb -left-24 top-10 h-72 w-72" />
      <span aria-hidden className="orb -right-20 top-24 h-96 w-96" />
      <span aria-hidden className="orb bottom-0 left-1/3 h-64 w-64" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        <div>
          <p className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-primary-ink">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--glow)]" aria-hidden />
            {t("brand.taglineLong")}
          </p>
          <h1 className="mt-6 text-balance font-display text-[2.9rem] font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4.4rem]">
            {t("hero.l1")}
            <br />
            <span className="text-primary text-glow">{nb(t("hero.l2"))}</span>
            {t("hero.l3") && (
              <>
                <br />
                {t("hero.l3")}
              </>
            )}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t("hero.sub")}
          </p>

          <form
            className="glass mt-8 flex max-w-xl items-center gap-2 rounded-full p-2 pl-5"
            onSubmit={(e) => {
              e.preventDefault();
              tryLog(title);
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder={t("hero.inputPh")}
              aria-label={t("hero.inputPh")}
              className="min-w-0 flex-1 bg-transparent py-2 text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="lg" className="shrink-0 px-6">
              {t("hero.inputBtn")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{t("hero.try")}</span>
            {CHIPS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => tryLog(t(k))}
                className="glass rounded-full px-3 py-1 text-foreground transition-colors hover:text-primary-ink"
              >
                {t(k)}
              </button>
            ))}
          </div>

          <a
            href="#dung-thu"
            className="mt-7 inline-flex items-center gap-3 text-sm font-semibold text-foreground hover:text-primary-ink"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-btn">
              <Play className="h-4 w-4 fill-current" />
            </span>
            {t("hero.sampleLink")}
          </a>
        </div>

        {/* hình chính + thẻ kính */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <SlotImage
            src="/images/diary-hero.png"
            alt={t("hero.visualAlt")}
            fallback={<DiaryFallback className="mx-auto w-full max-w-[26rem]" />}
            className="mx-auto w-full max-w-[28rem] object-contain drop-shadow-[0_24px_40px_var(--glow)]"
          />
          <div className="glass absolute -left-2 top-6 hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex lg:-left-8">
            <span className="h-9 w-1.5 rounded-full bg-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold">{t("hero.mockActivity")}</p>
              <p className="text-xs text-muted-foreground">{t("hero.mockMeta")}</p>
            </div>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
              {t("status.completed")}
            </span>
          </div>
          <ul className="glass mx-auto mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 rounded-2xl px-5 py-3 text-sm text-muted-foreground lg:absolute lg:-bottom-2 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2 lg:flex-nowrap">
            {CHECKS.map((k) => (
              <li key={k} className="flex items-center gap-1.5 whitespace-nowrap">
                <Check className="h-4 w-4 text-primary" aria-hidden />
                {t(k)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
