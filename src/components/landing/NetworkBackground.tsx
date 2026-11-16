import { useEffect, useRef } from "react";

// Lưới liên kết ở nền: các nút xếp thành lưới tam giác, đung đưa nhẹ quanh vị trí của mình.
// Nút to có viền, vài nút đổi màu; hạt sáng chạy dọc các đường nối; chuột đẩy các nút ra và làm sáng đường quanh nó.
type Node = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  ph: number;
  sp: number;
  r: number;
  tone: 0 | 1 | 2 | 3; // 0 hồng, 1 xanh trời, 2 vàng, 3 nút nhỏ
};
type Edge = [number, number];
type Pulse = { e: number; t: number; v: number; rev: boolean; tone: number };

const TONES = ["", "43,168,255", "255,184,40"];

export function NetworkBackground({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let pulses: Pulse[] = [];
    let pink = "255,45,149";
    let ink = "214,16,110";
    let dark = false;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    const mouse = { x: -9999, y: -9999 };

    function rgbOf(cssVar: string) {
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;visibility:hidden";
      probe.style.color = `var(${cssVar})`;
      wrap!.appendChild(probe);
      const css = getComputedStyle(probe).color;
      wrap!.removeChild(probe);
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      const g = c.getContext("2d", { willReadFrequently: true });
      if (!g) return null;
      g.fillStyle = css;
      g.fillRect(0, 0, 1, 1);
      const px = g.getImageData(0, 0, 1, 1).data;
      return `${px[0]},${px[1]},${px[2]}`;
    }
    function readColors() {
      pink = rgbOf("--primary") ?? pink;
      ink = rgbOf("--primary-ink") ?? ink;
      dark = document.documentElement.classList.contains("dark");
    }

    function build() {
      const gap = Math.max(84, Math.min(124, W / 11));
      const cols = Math.ceil(W / gap) + 2;
      const rows = Math.ceil(H / (gap * 0.86)) + 2;
      nodes = [];
      const idx = (c: number, r: number) => r * cols + c;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hx = (c - 0.5 + (r % 2 ? 0.5 : 0)) * gap + (Math.random() - 0.5) * gap * 0.32;
          const hy = (r - 0.5) * gap * 0.86 + (Math.random() - 0.5) * gap * 0.3;
          const roll = Math.random();
          const tone: Node["tone"] = roll < 0.07 ? 0 : roll < 0.11 ? 1 : roll < 0.14 ? 2 : 3;
          nodes.push({
            hx,
            hy,
            x: hx,
            y: hy,
            ph: Math.random() * Math.PI * 2,
            sp: 0.25 + Math.random() * 0.35,
            r: tone === 3 ? 2.4 + Math.random() * 0.8 : 5.2 + Math.random() * 1.6,
            tone,
          });
        }
      }
      edges = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(c, r);
          const odd = r % 2 === 1;
          const cand: [number, number][] = [
            [c + 1, r],
            [odd ? c : c - 1, r + 1],
            [odd ? c + 1 : c, r + 1],
          ];
          for (const [cc, rr] of cand) {
            if (cc < 0 || cc >= cols || rr >= rows) continue;
            if (Math.random() < 0.12) continue; // bỏ vài đường cho tự nhiên
            edges.push([i, idx(cc, rr)]);
          }
        }
      }
      pulses = [];
      const count = Math.max(8, Math.round((W * H) / 38000));
      for (let k = 0; k < count; k++) pulses.push(newPulse(Math.random()));
    }

    function newPulse(t0 = 0): Pulse {
      return {
        e: Math.floor(Math.random() * edges.length),
        t: t0,
        v: 0.22 + Math.random() * 0.3,
        rev: Math.random() < 0.5,
        tone: Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : 2,
      };
    }

    function resize() {
      const r = wrap!.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      build();
      draw(0);
    }

    function draw(dt: number) {
      clock += dt;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);

      for (const n of nodes) {
        const wob = reduce ? 0 : 1;
        n.x = n.hx + Math.sin(clock * n.sp + n.ph) * 9 * wob;
        n.y = n.hy + Math.cos(clock * n.sp * 0.9 + n.ph) * 9 * wob;
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 150 && d > 0.5) {
          const k = (1 - d / 150) * 22;
          n.x += (dx / d) * k;
          n.y += (dy / d) * k;
        }
      }

      // đường nối
      ctx!.lineCap = "round";
      const base = dark ? 0.34 : 0.4;
      const lineRgb = dark ? pink : ink;
      for (const [a, b] of edges) {
        const A = nodes[a]!;
        const B = nodes[b]!;
        const mx = (A.x + B.x) / 2;
        const my = (A.y + B.y) / 2;
        const near = Math.hypot(mx - mouse.x, my - mouse.y);
        const boost = near < 170 ? 1 + (1 - near / 170) * 1.6 : 1;
        ctx!.strokeStyle = `rgba(${lineRgb},${Math.min(0.9, base * boost)})`;
        ctx!.lineWidth = boost > 1.2 ? 1.8 : 1.3;
        ctx!.beginPath();
        ctx!.moveTo(A.x, A.y);
        ctx!.lineTo(B.x, B.y);
        ctx!.stroke();
      }

      // hạt sáng chạy dọc đường nối
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i]!;
        p.t += dt * p.v;
        if (p.t >= 1) {
          pulses[i] = newPulse(0);
          continue;
        }
        const [a, b] = edges[p.e]!;
        const A = nodes[a]!;
        const B = nodes[b]!;
        const t = p.rev ? 1 - p.t : p.t;
        const x = A.x + (B.x - A.x) * t;
        const y = A.y + (B.y - A.y) * t;
        const rgb = p.tone === 0 ? pink : TONES[p.tone]!;
        const fade = Math.sin(Math.PI * p.t);
        const g = ctx!.createRadialGradient(x, y, 0, x, y, 13);
        g.addColorStop(0, `rgba(${rgb},${0.85 * fade})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(x, y, 13, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = `rgba(255,255,255,${0.95 * fade})`;
        ctx!.beginPath();
        ctx!.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx!.fill();
      }

      // các nút
      for (const n of nodes) {
        const rgb = n.tone === 1 ? TONES[1]! : n.tone === 2 ? TONES[2]! : pink;
        if (n.tone === 3) {
          ctx!.fillStyle = `rgba(${dark ? pink : ink},${dark ? 0.7 : 0.6})`;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx!.fill();
          continue;
        }
        // quầng
        const glow = ctx!.createRadialGradient(n.x, n.y, n.r, n.x, n.y, n.r * 3.6);
        glow.addColorStop(0, `rgba(${rgb},${dark ? 0.4 : 0.32})`);
        glow.addColorStop(1, `rgba(${rgb},0)`);
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r * 3.6, 0, Math.PI * 2);
        ctx!.fill();
        // thân nút: viền màu, ruột trắng
        ctx!.fillStyle = dark ? `rgba(${rgb},1)` : "#fff";
        ctx!.strokeStyle = `rgba(${rgb},1)`;
        ctx!.lineWidth = 2.6;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.stroke();
        if (!dark) {
          ctx!.fillStyle = `rgba(${rgb},1)`;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, n.r * 0.38, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function loop(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !reduce) draw(dt);
      raf = requestAnimationFrame(loop);
    }

    readColors();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
    });
    io.observe(wrap);
    const mo = new MutationObserver(() => {
      readColors();
      draw(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    const host = wrap.parentElement ?? wrap;
    function move(e: PointerEvent) {
      const r = wrap!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }
    function leave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className={className}>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
