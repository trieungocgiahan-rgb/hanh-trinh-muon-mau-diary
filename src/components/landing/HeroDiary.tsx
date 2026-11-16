import type { CSSProperties, ReactNode } from "react";
import { Camera, CalendarDays, Heart, MapPin, MessageCircle, Mic, Sparkles } from "lucide-react";
import { SlotImage } from "@/components/illustrations/SlotImage";
import { useI18n } from "@/lib/i18n";

const WAVE = [5, 11, 7, 15, 9, 17, 6, 12, 8, 14, 5, 10];

// Cuốn nhật ký đang mở, vẽ bằng SVG. Nếu có ảnh /images/diary-open.png thì dùng ảnh đó.
function OpenDiary({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 330" className={className} role="img" aria-hidden>
      <defs>
        <linearGradient id="pgL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fffdfb" />
          <stop offset="0.82" stopColor="#fffaf7" />
          <stop offset="1" stopColor="#f1e3e0" />
        </linearGradient>
        <linearGradient id="pgR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fffdfb" />
          <stop offset="0.82" stopColor="#fffaf7" />
          <stop offset="1" stopColor="#f1e3e0" />
        </linearGradient>
        <linearGradient id="cover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--primary)" }} />
          <stop offset="1" style={{ stopColor: "var(--primary-ink)" }} />
        </linearGradient>
      </defs>
      {/* bóng dưới sách */}
      <ellipse cx="260" cy="300" rx="215" ry="16" fill="#000" opacity="0.12" />
      {/* bìa */}
      <path d="M22 96 C110 70 200 76 260 108 C320 76 410 70 498 96 L498 262 C410 240 320 246 260 276 C200 246 110 240 22 262 Z" fill="url(#cover)" />
      {/* các lớp giấy dày */}
      <path d="M34 262 C118 242 205 248 260 276 C315 248 402 242 486 262 L486 270 C402 250 315 256 260 284 C205 256 118 250 34 270 Z" fill="#f6e8e4" />
      {/* hai trang */}
      <path d="M36 92 C116 68 200 74 260 104 L260 268 C200 240 116 236 36 258 Z" fill="url(#pgL)" />
      <path d="M484 92 C404 68 320 74 260 104 L260 268 C320 240 404 236 484 258 Z" fill="url(#pgR)" />
      {/* gáy */}
      <path d="M260 104 L260 268" stroke="#e6d3cf" strokeWidth="2" />
      {/* trang trái: dòng chữ và băng dính */}
      <g fill="#ead8d4">
        <rect x="66" y="132" width="132" height="7" rx="3.5" transform="rotate(-4 66 132)" />
        <rect x="66" y="152" width="108" height="7" rx="3.5" transform="rotate(-4 66 152)" />
        <rect x="66" y="172" width="124" height="7" rx="3.5" transform="rotate(-4 66 172)" />
        <rect x="66" y="192" width="86" height="7" rx="3.5" transform="rotate(-4 66 192)" />
        <rect x="66" y="212" width="114" height="7" rx="3.5" transform="rotate(-4 66 212)" />
      </g>
      <rect x="70" y="104" width="56" height="16" rx="3" fill="#ffd166" opacity="0.85" transform="rotate(-6 70 104)" />
      {/* trang phải: ảnh dán và dòng chữ */}
      <g transform="rotate(3 370 160)">
        <rect x="318" y="112" width="112" height="92" rx="5" fill="#fff" stroke="#efdedb" />
        <rect x="326" y="120" width="96" height="62" rx="3" fill="#bfe3ff" />
        <circle cx="398" cy="140" r="8" fill="#ffd166" />
        <path d="M326 182 L352 152 L372 170 L390 154 L422 182Z" fill="#7dd3a8" />
      </g>
      <g fill="#ead8d4">
        <rect x="300" y="226" width="150" height="7" rx="3.5" transform="rotate(3 300 226)" />
        <rect x="300" y="244" width="112" height="7" rx="3.5" transform="rotate(3 300 244)" />
      </g>
      <path d="M456 124 c-8 -7 -5 -17 3 -17 c3 0 4 3 4 3 c0 0 1 -3 4 -3 c8 0 11 10 3 17 l-7 6 z" style={{ fill: "var(--primary)" }} />
      {/* dây đánh dấu trang */}
      <path d="M262 268 C264 292 256 306 248 318 L262 310 L276 320 C272 304 272 290 272 272Z" fill="#ff9ccb" />
    </svg>
  );
}

function Float({
  className,
  style,
  amp = 10,
  rot = 0,
  dur = 5,
  delay = 0,
  children,
}: {
  className: string;
  style?: CSSProperties;
  amp?: number;
  rot?: number;
  dur?: number;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ ...style }}
    >
      <div
        className="animate-float-y"
        style={{ "--amp": `${amp}px`, "--r": `${rot}deg`, "--dur": `${dur}s`, "--d": `${delay}s` } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

// Hạt nhỏ bay lên từ giữa cuốn sách
const PARTICLES: { x: number; y: number; rot: number; dur: number; d: number; kind: "heart" | "spark" | "dot"; c: string }[] = [
  { x: -90, y: -170, rot: -20, dur: 5.2, d: 0, kind: "heart", c: "text-primary" },
  { x: 40, y: -190, rot: 25, dur: 6, d: 1.1, kind: "spark", c: "text-amber" },
  { x: 120, y: -140, rot: 15, dur: 5.5, d: 2.2, kind: "heart", c: "text-primary" },
  { x: -150, y: -110, rot: -30, dur: 6.4, d: 3.0, kind: "spark", c: "text-azure" },
  { x: 10, y: -210, rot: 10, dur: 6.8, d: 3.8, kind: "dot", c: "text-tang" },
  { x: 170, y: -190, rot: 30, dur: 5.8, d: 4.4, kind: "spark", c: "text-primary" },
  { x: -50, y: -130, rot: -10, dur: 5, d: 2.8, kind: "dot", c: "text-azure" },
];

export function HeroDiary() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto aspect-[5/4.4] w-full max-w-[34rem]">
      {/* cuốn nhật ký mở */}
      <div className="absolute inset-x-[2%] bottom-[2%]">
        <SlotImage
          src="/images/diary-open.png"
          alt={t("hero.visualAlt")}
          fallback={<OpenDiary className="w-full drop-shadow-[0_20px_24px_rgba(60,20,40,0.14)]" />}
          className="w-full object-contain drop-shadow-[0_20px_24px_rgba(60,20,40,0.14)]"
        />
      </div>

      {/* hạt bay lên từ giữa sách */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[52%]">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`animate-rise absolute left-0 top-0 ${p.c}`}
            style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, "--rot": `${p.rot}deg`, "--dur": `${p.dur}s`, "--d": `${p.d}s` } as CSSProperties}
          >
            {p.kind === "heart" && <Heart className="h-5 w-5 fill-current" />}
            {p.kind === "spark" && <Sparkles className="h-5 w-5" />}
            {p.kind === "dot" && <span className="block h-3 w-3 rounded-full bg-current" />}
          </span>
        ))}
      </div>

      {/* đồ vật bay quanh */}
      <Float className="left-[2%] top-[5%]" rot={-8} amp={9} dur={5.5} delay={0.2}>
        <div className="w-24 rounded-md bg-white p-1.5 pb-5 shadow-pop">
          <div className="relative h-16 overflow-hidden rounded-sm bg-azure">
            <span className="absolute right-2 top-2 h-4 w-4 rounded-full bg-amber" />
            <span className="absolute -bottom-1 left-1 h-9 w-14 rounded-t-full bg-[oklch(0.72_0.14_160)]" />
          </div>
        </div>
      </Float>

      <Float className="right-[0%] top-[1%]" rot={4} amp={8} dur={6} delay={1}>
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-2 shadow-pop">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Mic className="h-3.5 w-3.5" />
          </span>
          <span className="flex h-5 items-center gap-[2px]">
            {WAVE.map((h, i) => (
              <span key={i} className="w-[2px] rounded-full bg-primary" style={{ height: h }} />
            ))}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">0:42</span>
        </div>
      </Float>

      <Float className="left-[43%] top-[-3%]" amp={12} dur={4.6} delay={0.6}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-btn">
          <Heart className="h-6 w-6 fill-current" />
        </span>
      </Float>

      <Float className="right-[6%] top-[37%]" rot={-4} amp={8} dur={5.2} delay={1.6}>
        <span className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-card px-3.5 py-2.5 shadow-pop">
          <MessageCircle className="h-4 w-4 text-azure" />
          <span className="flex gap-1">
            <i className="h-1.5 w-1.5 rounded-full bg-primary" />
            <i className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            <i className="h-1.5 w-1.5 rounded-full bg-primary/30" />
          </span>
        </span>
      </Float>

      <Float className="right-[0%] top-[17%]" rot={6} amp={9} dur={5.8} delay={0.9}>
        <div className="w-20 overflow-hidden rounded-xl bg-card text-center shadow-pop">
          <div className="flex items-center justify-center gap-1 bg-primary py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            <CalendarDays className="h-3 w-3" /> Nov
          </div>
          <div className="py-1.5 font-display text-2xl font-extrabold leading-none">15</div>
        </div>
      </Float>

      <Float className="left-[25%] top-[23%]" amp={7} dur={4.4} delay={2}>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tang text-[oklch(0.3_0.07_45)] shadow-pop">
          <MapPin className="h-5 w-5" />
        </span>
      </Float>

      <Float className="right-[24%] top-[24%] max-sm:hidden" amp={8} dur={5} delay={1.3}>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-azure text-white shadow-pop">
          <Camera className="h-5 w-5" />
        </span>
      </Float>

      <Float className="left-[40%] top-[16%]" rot={-5} amp={7} dur={5.6} delay={0.4}>
        <div className="w-28 rounded-sm bg-amber px-3 py-2.5 text-[oklch(0.3_0.06_80)] shadow-pop">
          <p className="text-xs font-bold leading-4">{t("hero.float.sticky")}</p>
        </div>
      </Float>

      <Float className="left-[3%] top-[34%]" rot={3} amp={7} dur={6.2} delay={2.4}>
        <span className="rounded-full bg-azure px-3 py-1.5 text-xs font-semibold text-white shadow-pop">
          {t("hero.float.city")}
        </span>
      </Float>
    </div>
  );
}
