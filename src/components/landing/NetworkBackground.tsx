import { useEffect, useRef } from "react";

// Lưới liên kết ở nền: các nút trôi chậm, nút nào gần nhau thì nối bằng đường mảnh.
// Con trỏ chuột kéo các nút lại gần và làm sáng đường nối quanh nó.
type Dot = { x: number; y: number; vx: number; vy: number; r: number; hub: boolean };

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
    let dots: Dot[] = [];
    let color = "255,45,149";
    let dark = false;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    const mouse = { x: -9999, y: -9999 };

    function readColor() {
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;visibility:hidden";
      probe.style.color = "var(--primary)";
      wrap!.appendChild(probe);
      const css = getComputedStyle(probe).color;
      wrap!.removeChild(probe);
      // quy mọi dạng màu (oklch, color(...)) về rgb bằng cách vẽ ra một điểm ảnh
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      const g = c.getContext("2d", { willReadFrequently: true });
      if (g) {
        g.fillStyle = css;
        g.fillRect(0, 0, 1, 1);
        const px = g.getImageData(0, 0, 1, 1).data;
        color = `${px[0]},${px[1]},${px[2]}`;
      }
      dark = document.documentElement.classList.contains("dark");
    }

    function seed() {
      const area = W * H;
      const n = Math.max(26, Math.min(86, Math.round(area / 15000)));
      dots = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: i % 7 === 0 ? 3.2 : 1.8 + Math.random() * 1.2,
        hub: i % 7 === 0,
      }));
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
      seed();
      draw(0);
    }

    function draw(dt: number) {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      const link = Math.min(190, Math.max(120, W / 7));
      const aLine = dark ? 0.42 : 0.3;

      for (const d of dots) {
        if (!reduce) {
          d.x += d.vx * dt * 60;
          d.y += d.vy * dt * 60;
          // kéo nhẹ về phía con trỏ
          const mx = mouse.x - d.x;
          const my = mouse.y - d.y;
          const md = Math.hypot(mx, my);
          if (md < 170 && md > 1) {
            d.x += (mx / md) * 0.35 * dt * 60 * (1 - md / 170);
            d.y += (my / md) * 0.35 * dt * 60 * (1 - md / 170);
          }
          if (d.x < -20) d.x = W + 20;
          else if (d.x > W + 20) d.x = -20;
          if (d.y < -20) d.y = H + 20;
          else if (d.y > H + 20) d.y = -20;
        }
      }

      ctx!.lineCap = "round";
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i]!;
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > link * link) continue;
          const t = 1 - Math.sqrt(d2) / link;
          const near = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) < 140 ? 1.9 : 1;
          ctx!.strokeStyle = `rgba(${color},${Math.min(0.75, aLine * t * near)})`;
          ctx!.lineWidth = a.hub || b.hub ? 1.4 : 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
      for (const d of dots) {
        ctx!.fillStyle = `rgba(${color},${d.hub ? 0.75 : 0.5})`;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fill();
        if (d.hub) {
          ctx!.strokeStyle = `rgba(${color},0.22)`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, d.r + 5, 0, Math.PI * 2);
          ctx!.stroke();
        }
      }
    }

    function loop(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !reduce) draw(dt);
      raf = requestAnimationFrame(loop);
    }

    readColor();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
    });
    io.observe(wrap);
    const mo = new MutationObserver(() => {
      readColor();
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
