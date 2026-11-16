import { useEffect, useRef, type CSSProperties } from "react";
import { Heart, Sparkles } from "lucide-react";
import { SlotImage } from "@/components/illustrations/SlotImage";
import { useI18n } from "@/lib/i18n";

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

// Nghiêng 3D theo con trỏ (máy tính) hoặc đung đưa nhẹ (màn cảm ứng). Mỗi lớp có độ sâu riêng.
function useTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = (el.closest("section") as HTMLElement | null) ?? el;
    const touch = window.matchMedia("(hover: none)").matches;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let running = false;
    const t0 = performance.now();

    function tick(now: number) {
      if (touch) {
        const t = (now - t0) / 1000;
        tx = Math.sin(t * 0.5) * 0.7;
        ty = Math.cos(t * 0.37) * 0.4;
      }
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el!.style.setProperty("--px", cx.toFixed(4));
      el!.style.setProperty("--py", cy.toFixed(4));
      if (touch || Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }
    function start() {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }
    function move(e: PointerEvent) {
      const r = section.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      start();
    }
    function leave() {
      tx = 0;
      ty = 0;
      start();
    }
    if (touch) start();
    else {
      section.addEventListener("pointermove", move);
      section.addEventListener("pointerleave", leave);
    }
    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
    };
  }, [ref]);
}

export function HeroDiary() {
  const { t } = useI18n();
  const tiltRef = useRef<HTMLDivElement>(null);
  useTilt(tiltRef);
  return (
    <div ref={tiltRef} className="relative mx-auto aspect-[3/2] w-full max-w-[40rem] [perspective:1200px] lg:max-w-none">
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(calc(var(--px, 0) * 8deg)) rotateX(calc(var(--py, 0) * -6deg))",
        }}
      >
        {/* ánh sáng phát ra từ giữa cuốn sách, nhịp thở nhẹ */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ transform: "translateZ(-60px)" }}>
          <span className="animate-glow absolute left-1/2 top-[46%] h-[78%] w-[78%] rounded-full bg-[radial-gradient(closest-side,oklch(0.93_0.12_85/0.9),oklch(0.85_0.14_20/0.45)_55%,transparent)]" />
          <span className="animate-glow absolute left-[56%] top-[30%] h-[40%] w-[40%] rounded-full bg-[radial-gradient(closest-side,var(--orb),transparent)]" style={{ animationDelay: "1.2s" }} />
        </div>

        {/* tia sáng quay chậm phía sau */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[46%] h-[110%] w-[110%]" style={{ transform: "translateZ(-40px) translate(-50%, -50%)" }}>
          <span className="animate-spin-slow absolute inset-0 rounded-full opacity-60 [background:conic-gradient(from_0deg,transparent_0deg,oklch(0.95_0.1_88/0.55)_14deg,transparent_34deg,transparent_120deg,oklch(0.9_0.1_10/0.45)_134deg,transparent_156deg,transparent_240deg,oklch(0.93_0.1_70/0.4)_254deg,transparent_276deg)] [mask-image:radial-gradient(closest-side,transparent_18%,#000_45%,transparent_92%)]" />
        </div>

        {/* ảnh chính: cuốn nhật ký bay, các trang tung ra, đồ vật tỏa quanh */}
        <div className="absolute inset-0" style={{ transform: "translateZ(30px)" }}>
          <div className="animate-float-y absolute inset-0" style={{ "--amp": "10px", "--r": "0deg", "--dur": "7s" } as CSSProperties}>
            <SlotImage
              src="/images/diary-open.webp"
              alt={t("hero.visualAlt")}
              fallback={<OpenDiary className="mx-auto mt-[8%] w-[82%] drop-shadow-[0_20px_24px_rgba(60,20,40,0.14)]" />}
              className="h-full w-full object-contain drop-shadow-[0_22px_28px_rgba(120,20,70,0.22)]"
            />
          </div>
        </div>

        {/* hạt bay lên từ giữa sách */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[50%]" style={{ transform: "translateZ(90px)", transformStyle: "preserve-3d" }}>
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`animate-rise absolute left-0 top-0 ${p.c}`}
              style={{ "--x": `${p.x * 1.4}px`, "--y": `${p.y * 1.1}px`, "--rot": `${p.rot}deg`, "--dur": `${p.dur}s`, "--d": `${p.d}s` } as CSSProperties}
            >
              {p.kind === "heart" && <Heart className="h-5 w-5 fill-current" />}
              {p.kind === "spark" && <Sparkles className="h-5 w-5" />}
              {p.kind === "dot" && <span className="block h-3 w-3 rounded-full bg-current" />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
