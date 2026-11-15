import { useEffect, useRef, useState } from "react";
import { LAND_ROWS } from "./land-dots";

// Quả địa cầu chấm tự xoay, vẽ bằng canvas. Có các thành phố nối với nhau bằng cung sáng,
// rê chuột vào một thành phố để xem tên, kéo để xoay tay. Đổi màu theo dự án và chế độ sáng/tối.

type City = { name: string; lat: number; lon: number };

const CITIES: City[] = [
  { name: "Lisbon", lat: 38.7, lon: -9.1 },
  { name: "Nairobi", lat: -1.3, lon: 36.8 },
  { name: "Hanoi", lat: 21.0, lon: 105.8 },
  { name: "Sydney", lat: -33.9, lon: 151.2 },
  { name: "Lima", lat: -12.0, lon: -77.0 },
  { name: "Toronto", lat: 43.7, lon: -79.4 },
];

// Các cặp thành phố được nối với nhau (chỉ số trong CITIES)
const ARCS: [number, number][] = [
  [5, 0],
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [0, 2],
];

const RAD = Math.PI / 180;
const TILT = 20 * RAD;

type Vec = [number, number, number];

function toVec(lat: number, lon: number): Vec {
  const φ = lat * RAD;
  const λ = lon * RAD;
  return [Math.cos(φ) * Math.sin(λ), Math.sin(φ), Math.cos(φ) * Math.cos(λ)];
}

function slerp(a: Vec, b: Vec, t: number): Vec {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const ang = Math.acos(dot);
  if (ang < 1e-5) return a;
  const s = Math.sin(ang);
  const wa = Math.sin((1 - t) * ang) / s;
  const wb = Math.sin(t * ang) / s;
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb];
}

function angleBetween(a: Vec, b: Vec) {
  return Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
}

// Xoay quanh trục dọc theo `rot`, rồi nghiêng về phía người xem.
function rotate(v: Vec, rot: number): Vec {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const x = v[0] * c - v[2] * s;
  const z = v[0] * s + v[2] * c;
  const ct = Math.cos(TILT);
  const st = Math.sin(TILT);
  return [x, v[1] * ct - z * st, v[1] * st + z * ct];
}

type Palette = { primary: string; card: string; fg: string; dark: boolean };

function readPalette(el: HTMLElement): Palette {
  // Đọc màu thật (đã thay biến CSS) qua một phần tử tạm
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  el.appendChild(probe);
  const read = (cssVar: string) => {
    probe.style.color = `var(${cssVar})`;
    return getComputedStyle(probe).color;
  };
  const palette = {
    primary: read("--primary"),
    card: read("--card"),
    fg: read("--foreground"),
    dark: document.documentElement.classList.contains("dark"),
  };
  el.removeChild(probe);
  return palette;
}

export function RotatingGlobe({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let size = 0;
    let dpr = 1;
    let palette = readPalette(wrap);
    let rot = 10 * RAD; // đang nhìn vào Đại Tây Dương: Âu, Phi và Mỹ cùng thấy
    let dragging = false;
    let lastX = 0;
    let resumeAt = 0;
    let hover = -1;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    let pinPos: { x: number; y: number; z: number }[] = [];

    const cityVecs = CITIES.map((c) => toVec(c.lat, c.lon));

    function resize() {
      const rect = wrap!.getBoundingClientRect();
      size = Math.max(1, Math.round(rect.width));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = size * dpr;
      canvas!.height = size * dpr;
      canvas!.style.height = `${size}px`;
    }

    function project(v: Vec, rotation: number, R: number, cx: number, cy: number, lift = 1) {
      const r = rotate(v, rotation);
      return { x: cx + r[0] * R * lift, y: cy - r[1] * R * lift, z: r[2] };
    }

    function draw(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging && !reduce && now > resumeAt) rot += dt * 0.16; // ~9 độ mỗi giây

      const W = size;
      const R = W * 0.4;
      const cx = W / 2;
      const cy = W / 2;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, W);

      // thân quả cầu
      ctx!.globalAlpha = 1;
      let g: CanvasGradient;
      ctx!.fillStyle = palette.card;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.fill();
      g = ctx!.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      g.addColorStop(0, palette.dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.9)");
      g.addColorStop(0.55, "rgba(255,255,255,0)");
      g.addColorStop(1, "transparent");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.globalAlpha = palette.dark ? 0.16 : 0.1;
      ctx!.fillStyle = palette.primary;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.fill();

      // viền cầu
      ctx!.globalAlpha = 0.45;
      ctx!.strokeStyle = palette.primary;
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.stroke();

      // đường kinh vĩ mờ
      ctx!.globalAlpha = 0.1;
      ctx!.strokeStyle = palette.fg;
      ctx!.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx!.beginPath();
        let pen = false;
        for (let lon = -180; lon <= 180; lon += 6) {
          const p = project(toVec(lat, lon), rot, R, cx, cy);
          if (p.z > 0) {
            if (!pen) ctx!.moveTo(p.x, p.y);
            else ctx!.lineTo(p.x, p.y);
            pen = true;
          } else pen = false;
        }
        ctx!.stroke();
      }
      for (let lon = -180; lon < 180; lon += 30) {
        ctx!.beginPath();
        let pen = false;
        for (let lat = -90; lat <= 90; lat += 6) {
          const p = project(toVec(lat, lon), rot, R, cx, cy);
          if (p.z > 0) {
            if (!pen) ctx!.moveTo(p.x, p.y);
            else ctx!.lineTo(p.x, p.y);
            pen = true;
          } else pen = false;
        }
        ctx!.stroke();
      }

      // đất liền: các chấm nhỏ
      ctx!.fillStyle = palette.primary;
      const base = W * 0.0062;
      for (const [lat10, lons] of LAND_ROWS) {
        const lat = lat10 / 10;
        for (const lon10 of lons) {
          const p = project(toVec(lat, lon10 / 10), rot, R, cx, cy);
          if (p.z <= 0.02) continue;
          ctx!.globalAlpha = 0.18 + 0.7 * p.z;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, base * (0.55 + 0.6 * p.z), 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // cung nối giữa các thành phố, có hạt sáng chạy dọc
      const time = now / 1000;
      ARCS.forEach(([a, b], i) => {
        const va = cityVecs[a]!;
        const vb = cityVecs[b]!;
        const ang = angleBetween(va, vb);
        const lift = 0.1 + ang * 0.16;
        const N = 36;
        ctx!.strokeStyle = palette.primary;
        ctx!.lineWidth = 1.8;
        ctx!.lineCap = "round";
        ctx!.globalAlpha = 0.8;
        ctx!.beginPath();
        let pen = false;
        for (let k = 0; k <= N; k++) {
          const t = k / N;
          const v = slerp(va, vb, t);
          const h = 1 + lift * Math.sin(Math.PI * t);
          const p = project(v, rot, R, cx, cy, h);
          if (p.z > 0.02) {
            if (!pen) ctx!.moveTo(p.x, p.y);
            else ctx!.lineTo(p.x, p.y);
            pen = true;
          } else pen = false;
        }
        ctx!.stroke();
        // hạt sáng
        const t = (time * 0.22 + i * 0.19) % 1;
        const v = slerp(va, vb, t);
        const p = project(v, rot, R, cx, cy, 1 + lift * Math.sin(Math.PI * t));
        if (p.z > 0.02) {
          ctx!.globalAlpha = 0.35;
          ctx!.fillStyle = palette.primary;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, W * 0.016, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.globalAlpha = 1;
          ctx!.fillStyle = "#fff";
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, W * 0.006, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      // thành phố
      pinPos = cityVecs.map((v) => project(v, rot, R, cx, cy));
      CITIES.forEach((c, i) => {
        const p = pinPos[i]!;
        if (p.z <= 0.05) return;
        const pulse = (time * 0.8 + i * 0.37) % 1;
        const hot = hover === i;
        ctx!.globalAlpha = (1 - pulse) * 0.5;
        ctx!.strokeStyle = palette.primary;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, W * (0.014 + pulse * 0.03), 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = "#fff";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, W * (hot ? 0.02 : 0.016), 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = palette.primary;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, W * (hot ? 0.014 : 0.011), 0, Math.PI * 2);
        ctx!.fill();
        // tên thành phố
        if (hot) {
          ctx!.font = `600 ${Math.round(W * 0.034)}px "Be Vietnam Pro", system-ui, sans-serif`;
          const tw = ctx!.measureText(c.name).width;
          const bw = tw + W * 0.05;
          const bh = W * 0.06;
          const bx = Math.min(W - bw - 4, Math.max(4, p.x - bw / 2));
          const by = p.y - W * 0.095;
          ctx!.fillStyle = palette.card;
          ctx!.globalAlpha = 1;
          ctx!.beginPath();
          ctx!.roundRect(bx, by, bw, bh, bh / 2);
          ctx!.fill();
          ctx!.strokeStyle = palette.primary;
          ctx!.lineWidth = 1.5;
          ctx!.stroke();
          ctx!.fillStyle = palette.fg;
          ctx!.textBaseline = "middle";
          ctx!.fillText(c.name, bx + W * 0.025, by + bh / 2 + 1);
        }
      });
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      if (visible) draw(now);
      raf = requestAnimationFrame(loop);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
    });
    io.observe(wrap);
    // đổi sáng/tối hoặc màu dự án: đọc lại bảng màu
    const mo = new MutationObserver(() => {
      palette = readPalette(wrap);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    function pos(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function onDown(e: PointerEvent) {
      dragging = true;
      lastX = e.clientX;
      canvas!.setPointerCapture(e.pointerId);
    }
    function onMove(e: PointerEvent) {
      if (dragging) {
        rot += (e.clientX - lastX) * 0.008;
        lastX = e.clientX;
        return;
      }
      const { x, y } = pos(e);
      let best = -1;
      let bd = 22;
      pinPos.forEach((p, i) => {
        if (p.z <= 0.05) return;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      hover = best;
      canvas!.style.cursor = best >= 0 ? "pointer" : "grab";
      setLabel(best >= 0 ? CITIES[best]!.name : null);
    }
    function onUp() {
      dragging = false;
      resumeAt = performance.now() + 1200;
    }
    function onLeave() {
      hover = -1;
      setLabel(null);
    }
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      {/* hào quang hồng phía sau, vẽ bằng CSS để mép mờ đều */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[-4%] rounded-full"
        style={{ background: "radial-gradient(closest-side, var(--orb), transparent)" }}
      />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A globe that turns slowly, with cities linked by glowing arcs"
        className="block w-full touch-pan-y"
      />
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </div>
  );
}
