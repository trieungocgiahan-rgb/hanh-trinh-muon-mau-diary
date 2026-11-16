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

// Mạng liên kết: mọi thứ trong cuốn nhật ký nối với nhau và nối về giữa sách.
// Toạ độ theo ảnh gốc (1536 x 1024) để khớp với vị trí đồ vật trong ảnh.
const HUB = { x: 760, y: 565 };
const NODES = {
  mic: { x: 232, y: 206 },
  heart: { x: 770, y: 34 },
  cal: { x: 1362, y: 196 },
  pin: { x: 112, y: 382 },
  chat: { x: 1348, y: 372 },
  pic: { x: 1418, y: 522 },
  cardA: { x: 508, y: 44 },
  cardB: { x: 1120, y: 142 },
  hl: { x: 208, y: 276 },
  hr: { x: 1170, y: 86 },
} as const;
type NodeKey = keyof typeof NODES;

// [từ, tới, độ cong] - độ cong dương uốn sang một bên, âm sang bên kia
const LINKS: { a: NodeKey | "hub"; b: NodeKey; bend: number; hub?: boolean }[] = [
  { a: "hub", b: "mic", bend: -90, hub: true },
  { a: "hub", b: "heart", bend: 60, hub: true },
  { a: "hub", b: "cal", bend: 90, hub: true },
  { a: "hub", b: "pin", bend: 80, hub: true },
  { a: "hub", b: "chat", bend: -80, hub: true },
  { a: "hub", b: "pic", bend: -60, hub: true },
  { a: "hub", b: "cardA", bend: 70, hub: true },
  { a: "hub", b: "cardB", bend: -60, hub: true },
  { a: "pin", b: "mic", bend: -70 },
  { a: "mic", b: "cardA", bend: -50 },
  { a: "cardA", b: "heart", bend: -40 },
  { a: "heart", b: "cardB", bend: -40 },
  { a: "cardB", b: "cal", bend: -40 },
  { a: "cal", b: "chat", bend: -30 },
  { a: "chat", b: "pic", bend: -30 },
  { a: "hl", b: "mic", bend: 20 },
  { a: "hr", b: "cal", bend: 30 },
];

function curve(from: { x: number; y: number }, to: { x: number; y: number }, bend: number) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M${from.x} ${from.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`;
}

function NetworkLinks({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 1536 1024" className={`pointer-events-none ${className}`} style={style}>
      <g fill="none" strokeLinecap="round">
        {LINKS.map((l, i) => {
          const from = l.a === "hub" ? HUB : NODES[l.a];
          const d = curve(from, NODES[l.b], l.bend);
          return (
            <g key={i}>
              <path
                d={d}
                stroke="var(--link)"
                strokeWidth={l.hub ? 5.5 : 4.5}
                strokeDasharray={l.hub ? "1 9" : "1 12"}
                opacity={l.hub ? 0.9 : 0.95}
              />
              <path
                d={d}
                pathLength={100}
                stroke="var(--primary)"
                strokeWidth={l.hub ? 12 : 9}
                className="link-pulse"
                style={{ animationDuration: `${l.hub ? 4.2 + (i % 4) * 0.7 : 5.6 + (i % 3) * 0.8}s`, animationDelay: `${(i * 0.55) % 3.4}s` }}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// Các nút nối nằm phía trước ảnh, nhấp nháy nhẹ.
function NetworkNodes({ className, style }: { className: string; style?: CSSProperties }) {
  const keys = Object.keys(NODES) as NodeKey[];
  return (
    <svg aria-hidden viewBox="0 0 1536 1024" className={`pointer-events-none ${className}`} style={style}>
      <g transform={`translate(${HUB.x} ${HUB.y})`}>
        <circle r={34} className="node-ping" style={{ fill: "var(--primary)" }} />
        <circle r={15} style={{ fill: "#fff", stroke: "var(--primary)", strokeWidth: 6 }} />
      </g>
      {keys.map((k, i) => {
        const n = NODES[k];
        const big = ["mic", "heart", "cal", "pin", "chat", "pic", "cardA", "cardB"].includes(k);
        return (
          <g key={k} transform={`translate(${n.x} ${n.y})`}>
            <circle r={big ? 20 : 13} className="node-ping" style={{ fill: "var(--primary)", animationDelay: `${i * 0.37}s` }} />
            <circle r={big ? 12 : 8} style={{ fill: "var(--card)", stroke: "var(--primary)", strokeWidth: big ? 5 : 4 }} />
            <circle r={big ? 4.5 : 3} style={{ fill: "var(--primary)" }} />
          </g>
        );
      })}
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
    <div ref={tiltRef} className="relative z-0 mx-auto aspect-[3/2] w-full max-w-[40rem] [perspective:1200px] lg:max-w-none">
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(calc(var(--px, 0) * 8deg)) rotateX(calc(var(--py, 0) * -6deg))",
        }}
      >
        {/* quầng sáng lớn hòa vào nền: rộng, mờ dần ra ngoài, không có mép */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ transform: "translateZ(-80px)" }}>
          <span className="animate-glow absolute left-1/2 top-[48%] h-[130%] w-[130%] rounded-full [background:radial-gradient(closest-side,var(--halo-core),var(--halo-mid)_38%,var(--halo-edge)_66%,transparent)]" />
          <span className="animate-glow absolute left-[48%] top-[50%] h-[86%] w-[86%] rounded-full [background:radial-gradient(closest-side,oklch(1_0.05_92/0.95),oklch(0.97_0.08_60/0.55)_55%,transparent)]" style={{ animationDelay: "1.4s" }} />
        </div>


        {/* tia sáng quay chậm */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[48%] h-[120%] w-[120%]" style={{ transform: "translateZ(-50px) translate(-50%, -50%)" }}>
          <span className="animate-spin-slow absolute inset-0 rounded-full opacity-70 [background:conic-gradient(from_0deg,transparent_0deg,oklch(0.96_0.1_88/0.55)_12deg,transparent_30deg,transparent_95deg,oklch(0.9_0.14_10/0.5)_108deg,transparent_128deg,transparent_200deg,oklch(0.95_0.1_70/0.45)_214deg,transparent_236deg,transparent_290deg,oklch(0.9_0.12_350/0.4)_300deg,transparent_320deg)] [mask-image:radial-gradient(closest-side,transparent_14%,#000_40%,transparent_90%)]" />
        </div>

        {/* ảnh chính: cuốn nhật ký bay, các trang tung ra, đồ vật tỏa quanh */}
        <div className="absolute inset-0" style={{ transform: "translateZ(30px)" }}>
          <div className="animate-float-y absolute inset-0" style={{ "--amp": "10px", "--r": "0deg", "--dur": "7s" } as CSSProperties}>
            <SlotImage
              src="/images/diary-open.webp"
              alt={t("hero.visualAlt")}
              fallback={<OpenDiary className="mx-auto mt-[8%] w-[82%] drop-shadow-[0_20px_24px_rgba(60,20,40,0.14)]" />}
              className="h-full w-full object-contain drop-shadow-[0_18px_26px_rgba(255,45,149,0.2)]"
            />
          </div>
        </div>

        {/* mạng liên kết và các nút nối nằm trước ảnh */}
        <NetworkLinks className="absolute inset-0 h-full w-full" style={{ transform: "translateZ(50px)" }} />
        <NetworkNodes className="absolute inset-0 h-full w-full" style={{ transform: "translateZ(60px)" }} />

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
