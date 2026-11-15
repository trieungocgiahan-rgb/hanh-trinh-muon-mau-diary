import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import group from "@/assets/landing-group.jpg";
import { useI18n } from "@/lib/i18n";
import { DEMO_ADD_EVENT } from "./demo/demo-data";

const nb = (s: string) => s.replace(/ (\S+)$/, "\u00A0$1");
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
    <section className="relative overflow-hidden bg-[var(--page-tint)] pb-16 pt-12 sm:pb-24 sm:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            {t("brand.taglineLong")}
          </p>
          <h1 className="mt-6 text-balance font-display text-[2.9rem] font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
            {t("hero.l1")}
            <br />
            <span className="text-primary">{nb(t("hero.l2"))}</span>
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
            className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-pop"
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
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="lg" className="shrink-0 px-5">
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
                className="rounded-full border border-border bg-card px-3 py-1 text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {t(k)}
              </button>
            ))}
          </div>

          <a
            href="#dung-thu"
            className="mt-7 inline-flex items-center gap-3 text-sm font-semibold text-foreground hover:text-primary"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
            {t("hero.sampleLink")}
          </a>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {CHECKS.map((k) => (
              <li key={k} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" aria-hidden />
                {t(k)}
              </li>
            ))}
          </ul>
        </div>

        <figure>
          <img
            src={group}
            alt={t("hero.photoAlt")}
            width={1200}
            height={912}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-pop"
          />
          <figcaption className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-4 w-1 shrink-0 rounded-full bg-type-workshop" aria-hidden />
              <span className="truncate">
                <span className="font-medium text-foreground">{t("hero.mockActivity")}</span> ·{" "}
                {t("hero.mockMeta")}
              </span>
            </span>
            <Link to="/auth" className="shrink-0 font-medium text-primary hover:underline">
              {t("common.enterJournal")}
            </Link>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
