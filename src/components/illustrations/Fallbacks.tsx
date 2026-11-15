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

const PINS: [number, number][] = [
  [128, 150],
  [262, 128],
  [300, 232],
  [160, 276],
  [222, 214],
  [98, 232],
];

export function GlobeFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-hidden overflow="visible">
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
        {/* sợi nối giữa mọi nơi */}
        <g fill="none" strokeWidth="3" strokeLinecap="round" style={{ stroke: "var(--primary)" }}>
          <path d="M128 150 Q196 82 262 128" />
          <path d="M262 128 Q330 176 300 232" />
          <path d="M300 232 Q240 290 160 276" />
          <path d="M160 276 Q82 262 98 232" />
          <path d="M98 232 Q96 180 128 150" />
          <path d="M128 150 Q190 190 222 214" opacity="0.7" />
          <path d="M262 128 Q232 170 222 214" opacity="0.7" />
          <path d="M300 232 Q262 222 222 214" opacity="0.7" />
        </g>
        {PINS.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r="13" style={{ fill: "var(--primary)" }} />
            <circle r="5" fill="#fff" />
          </g>
        ))}
      </g>
    </svg>
  );
}
