import { Reveal } from "@/components/Reveal";
import { useI18n } from "@/lib/i18n";
import type { Key } from "@/lib/i18n";

// Ảnh chụp sản phẩm thật (public/images/product-*.jpg), xen kẽ trái phải như một bài báo.
const SHOTS: { img: string; title: Key; body: Key; alt: string }[] = [
  { img: "/images/product-journal.jpg", title: "shots.journal.title", body: "shots.journal.body", alt: "The Journal page: a feed of entries with photos" },
  { img: "/images/product-calendar.jpg", title: "shots.calendar.title", body: "shots.calendar.body", alt: "The calendar page showing a month of entries" },
  { img: "/images/product-report.jpg", title: "shots.report.title", body: "shots.report.body", alt: "A PDF report with a cover photo and key numbers" },
];

const MORE: { t: Key; b: Key }[] = [
  { t: "more.m1.t", b: "more.m1.b" },
  { t: "more.m2.t", b: "more.m2.b" },
  { t: "more.m3.t", b: "more.m3.b" },
  { t: "more.m4.t", b: "more.m4.b" },
  { t: "more.m5.t", b: "more.m5.b" },
  { t: "more.m6.t", b: "more.m6.b" },
];

export function LandingFeatures() {
  const { t } = useI18n();
  return (
    <section id="tinh-nang" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {t("features.title1")} <em className="font-medium italic text-primary">{t("features.title2")}</em>
        </h2>

        <div className="mt-14 space-y-20 sm:space-y-28">
          {SHOTS.map((s, i) => (
            <Reveal key={s.img}>
              <div
                className={`grid items-center gap-8 lg:gap-14 ${
                  i % 2 === 1
                    ? "lg:grid-cols-[1.2fr_0.8fr] lg:[&>*:first-child]:order-2"
                    : "lg:grid-cols-[0.8fr_1.2fr]"
                }`}
              >
                <div>
                  <h3 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{t(s.title)}</h3>
                  <p className="mt-4 max-w-md text-lg leading-8 text-foreground/75">{t(s.body)}</p>
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-pop">
                  <img
                    src={s.img}
                    alt={s.alt}
                    width={1440}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-24 border-t border-border pt-10 sm:mt-32">
          <h3 className="font-display text-2xl font-semibold">{t("more.title")}</h3>
          <dl className="mt-6 grid gap-x-12 sm:grid-cols-2">
            {MORE.map((m) => (
              <div key={m.t} className="border-b border-border py-5">
                <dt className="font-semibold">{t(m.t)}</dt>
                <dd className="mt-1 leading-7 text-foreground/70">{t(m.b)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
