import { useState } from "react";

// Hình vẽ tạm (hồng - trắng) dùng khi chưa có ảnh 3D thật trong public/images.

export function DiaryFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-hidden overflow="visible">
      <defs>
        <linearGradient id="dfCover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary-ink)" />
        </linearGradient>
      </defs>
      <g style={{ filter: "drop-shadow(0 18px 30px var(--glow))" }}>
        {/* quỹ đạo */}
        <ellipse
          cx="200"
          cy="215"
          rx="178"
          ry="66"
          transform="rotate(-16 200 215)"
          fill="none"
          strokeWidth="3"
          style={{ stroke: "var(--primary)" }}
          opacity="0.55"
        />
        {/* ảnh polaroid */}
        <g transform="rotate(-10 70 90)">
          <rect x="30" y="52" width="82" height="92" rx="6" fill="#fff" />
          <rect x="38" y="60" width="66" height="60" rx="3" style={{ fill: "color-mix(in oklab, var(--primary) 22%, white)" }} />
        </g>
        <g transform="rotate(9 335 300)">
          <rect x="296" y="262" width="78" height="86" rx="6" fill="#fff" />
          <rect x="303" y="269" width="64" height="56" rx="3" style={{ fill: "color-mix(in oklab, var(--primary) 30%, white)" }} />
        </g>
        {/* cuốn nhật ký */}
        <g transform="rotate(7 200 200)">
          <rect x="118" y="62" width="170" height="262" rx="22" fill="url(#dfCover)" />
          <rect x="276" y="74" width="16" height="238" rx="5" fill="#fff" opacity="0.95" />
          <rect x="118" y="62" width="26" height="262" rx="13" style={{ fill: "var(--primary-ink)" }} opacity="0.55" />
          <path d="M214 324 C214 344 206 358 196 372 L214 362 L230 374 C226 356 226 340 226 324Z" fill="#ffd3e8" />
          {/* khóa hai vòng */}
          <g fill="none" stroke="#fff" strokeWidth="5">
            <circle cx="262" cy="190" r="14" />
            <circle cx="276" cy="190" r="14" opacity="0.85" />
          </g>
          <rect x="160" y="108" width="78" height="9" rx="4.5" fill="#fff" opacity="0.5" />
          <rect x="160" y="128" width="52" height="9" rx="4.5" fill="#fff" opacity="0.35" />
        </g>
      </g>
    </svg>
  );
}

const PINS: { x: number; y: number; city: string; time: string }[] = [
  { x: 128, y: 150, city: "Toronto", time: "04:20" },
  { x: 262, y: 128, city: "Lisbon", time: "09:12" },
  { x: 300, y: 232, city: "Nairobi", time: "11:05" },
  { x: 160, y: 276, city: "Lima", time: "03:50" },
  { x: 222, y: 214, city: "Cairo", time: "11:30" },
  { x: 98, y: 232, city: "Mexico City", time: "02:45" },
];

// Sợi nối giữa các cặp ghim (chỉ số trong PINS)
const LINKS: [number, number, string][] = [
  [0, 1, "M128 150 Q196 82 262 128"],
  [1, 2, "M262 128 Q330 176 300 232"],
  [2, 3, "M300 232 Q240 290 160 276"],
  [3, 5, "M160 276 Q82 262 98 232"],
  [5, 0, "M98 232 Q96 180 128 150"],
  [0, 4, "M128 150 Q190 190 222 214"],
  [1, 4, "M262 128 Q232 170 222 214"],
  [2, 4, "M300 232 Q262 222 222 214"],
];

// Quả cầu tương tác: rê hoặc bấm vào một ghim để thấy các sợi nối của nơi đó sáng lên.
export function GlobeFallback({ className }: { className?: string }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <svg viewBox="0 0 400 400" className={className} role="group" aria-label="Interactive globe" overflow="visible">
      <defs>
        <radialGradient id="gfBall" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--primary) 18%, white)" }} />
        </radialGradient>
      </defs>
      <g style={{ filter: "drop-shadow(0 20px 36px var(--glow))" }}>
        <circle cx="200" cy="200" r="150" fill="url(#gfBall)" stroke="#fff" strokeWidth="3" />
        <g fill="none" strokeWidth="1.6" style={{ stroke: "var(--primary)" }} opacity="0.28">
          <ellipse cx="200" cy="200" rx="150" ry="52" />
          <ellipse cx="200" cy="200" rx="150" ry="104" />
          <ellipse cx="200" cy="200" rx="52" ry="150" />
          <ellipse cx="200" cy="200" rx="104" ry="150" />
          <line x1="50" y1="200" x2="350" y2="200" />
        </g>
      </g>
      {/* sợi nối: nét đứt chảy, sáng lên khi ghim liên quan được chọn */}
      <g fill="none" strokeLinecap="round">
        {LINKS.map(([a, b, d]) => {
          const on = active !== null && (a === active || b === active);
          return (
            <path
              key={d}
              d={d}
              className="thread-flow"
              strokeDasharray="4 8"
              strokeWidth={on ? 4 : 2.5}
              style={{
                stroke: on ? "var(--tang)" : "var(--primary)",
                opacity: active === null || on ? 1 : 0.25,
                transition: "opacity .2s, stroke-width .2s",
              }}
            />
          );
        })}
      </g>
      {PINS.map((p, i) => {
        const on = active === i;
        return (
          <g
            key={p.city}
            transform={`translate(${p.x} ${p.y})`}
            tabIndex={0}
            role="button"
            aria-label={`${p.city}, ${p.time}`}
            className="cursor-pointer outline-none"
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(on ? null : i)}
          >
            <circle r="26" fill="transparent" />
            <circle r={on ? 18 : 13} style={{ fill: on ? "var(--tang)" : "var(--primary)", transition: "all .2s" }} />
            <circle r="5" fill="#fff" />
            {on && (
              <g transform="translate(0 -34)">
                <rect x="-46" y="-16" width="92" height="30" rx="15" fill="#fff" style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,.15))" }} />
                <text textAnchor="middle" y="4" fontSize="12" fontWeight="700" style={{ fill: "var(--foreground)" }}>
                  {p.city} · {p.time}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
