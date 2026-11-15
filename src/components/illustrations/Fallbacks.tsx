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
