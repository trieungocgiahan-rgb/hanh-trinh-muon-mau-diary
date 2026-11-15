import { Person } from "./People";

const heart = "M0 8 C-14 -2 -12 -14 -4 -14 C0 -14 0 -10 0 -10 C0 -10 0 -14 4 -14 C12 -14 14 -2 0 8Z";
const sparkle = "M0 -9 C1 -3 3 -1 9 0 C3 1 1 3 0 9 C-1 3 -3 1 -9 0 C-3 -1 -1 -3 0 -9Z";

// "Cả đội bên nhau": năm người vây quanh cuốn nhật ký chung, nối với nhau bằng nét đứt và trái tim.
export function TeamIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 500"
      className={className}
      role="img"
      aria-label="Cả đội cùng bên nhau quanh cuốn nhật ký chung"
    >
      {/* nền loang */}
      <path
        d="M70 140 C40 40 190 -10 300 22 C420 -6 540 60 520 190 C560 300 480 430 330 440 C190 470 40 420 40 290 C20 230 90 200 70 140Z"
        style={{ fill: "color-mix(in oklab, var(--primary) 16%, var(--background))" }}
      />
      <circle cx="505" cy="60" r="22" fill="#ffd166" opacity="0.9" />
      <circle cx="46" cy="330" r="14" fill="#7be0bd" opacity="0.9" />

      {/* nét nối giữa mọi người */}
      <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 9" style={{ stroke: "var(--primary)" }}>
        <path d="M112 190 C140 120 170 110 204 150" />
        <path d="M204 150 C240 90 300 90 330 130" />
        <path d="M330 130 C380 80 430 100 440 160" />
        <path d="M204 150 C250 200 290 210 330 130" opacity="0.6" />
      </g>
      <g style={{ fill: "var(--primary)" }}>
        <path d={heart} transform="translate(156 112) scale(0.9)" />
        <path d={heart} transform="translate(268 82) scale(0.9)" />
        <path d={heart} transform="translate(402 94) scale(0.8)" />
      </g>

      {/* hàng sau */}
      <Person x={200} y={172} scale={0.95} skin="#d9a37d" hair="#3a2530" style="curly" top="#ffc94d" delay={0.4} />
      <Person x={350} y={162} scale={0.95} skin="#f7d9c4" hair="#7a4a2e" style="bun" top="#a68bff" delay={0.9} />

      {/* hàng trước */}
      <Person x={104} y={238} scale={1.05} skin="#f4cfae" hair="#e0537f" style="long" top="#5fd3ad" wave delay={0} />
      <Person x={280} y={222} scale={1.18} skin="#a9714f" hair="#2f2a45" style="short" top="#ff6f9c" delay={0.6} />
      <Person x={456} y={240} scale={1.05} skin="#8a5a3c" hair="#f0b84a" style="curly" top="#62a8ff" delay={1.1} />

      {/* mặt bàn che chân thân người */}
      <rect x="10" y="378" width="540" height="102" rx="30" style={{ fill: "color-mix(in oklab, var(--primary) 30%, var(--background))" }} />

      {/* cuốn nhật ký chung phía trước */}
      <g transform="translate(280 398) rotate(-3)">
        <rect x="-150" y="-52" width="300" height="140" rx="14" fill="#e8527f" />
        <rect x="-142" y="-60" width="142" height="124" rx="8" fill="#fffaf5" />
        <rect x="0" y="-60" width="142" height="124" rx="8" fill="#fffdf9" />
        <path d="M0 -60 V64" stroke="#e9d9d2" strokeWidth="2" />
        {/* ảnh dán trang trái */}
        <g transform="rotate(-4 -70 -22)">
          <rect x="-124" y="-48" width="82" height="62" rx="4" fill="#ffffff" stroke="#ecd9d2" />
          <rect x="-118" y="-42" width="70" height="42" rx="2" fill="#9fd4ff" />
          <circle cx="-62" cy="-28" r="7" fill="#ffd166" />
          <path d="M-118 -2 L-92 -22 L-72 -8 L-56 -18 L-48 -2Z" fill="#5fd3ad" />
        </g>
        <rect x="-122" y="26" width="74" height="5" rx="2.5" fill="#e3d3cc" />
        <rect x="-122" y="38" width="52" height="5" rx="2.5" fill="#e3d3cc" />
        {/* chữ trang phải */}
        {[-36, -20, -4, 12, 28, 44].map((yy, i) => (
          <rect key={yy} x="16" y={yy} width={i % 3 === 2 ? 70 : 108} height="5" rx="2.5" fill="#ead9d2" />
        ))}
        <path d={heart} transform="translate(112 -36) scale(0.8)" fill="#e8527f" />
      </g>

      {/* bong bóng nhỏ quanh cảnh */}
      <g className="ill-float" style={{ animationDelay: "0s" }}>
        <circle cx="62" cy="86" r="27" fill="#ff6f9c" />
        <path d={heart} transform="translate(62 90) scale(1.15)" fill="#fff" />
      </g>
      <g className="ill-float" style={{ animationDelay: "0.8s" }}>
        <rect x="448" y="26" width="64" height="48" rx="14" fill="#ffc94d" />
        <path d="M468 74 L460 90 L486 74Z" fill="#ffc94d" />
        <rect x="466" y="40" width="28" height="22" rx="5" fill="#fff" />
        <circle cx="480" cy="51" r="6" fill="#ffc94d" />
        <rect x="470" y="36" width="10" height="5" rx="2" fill="#fff" />
      </g>
      <g className="ill-float" style={{ animationDelay: "1.5s" }}>
        <rect x="236" y="20" width="84" height="38" rx="19" fill="#fff" stroke="#f1d4dd" />
        <circle cx="262" cy="39" r="4.5" style={{ fill: "var(--primary)" }} />
        <circle cx="278" cy="39" r="4.5" style={{ fill: "var(--primary)" }} opacity="0.65" />
        <circle cx="294" cy="39" r="4.5" style={{ fill: "var(--primary)" }} opacity="0.35" />
      </g>
      <g className="ill-float" style={{ animationDelay: "2.2s" }}>
        <circle cx="520" cy="250" r="24" fill="#a68bff" />
        <rect x="514" y="236" width="12" height="20" rx="6" fill="#fff" />
        <path d="M508 252 C508 266 532 266 532 252" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </g>
      <path d={sparkle} transform="translate(36 214) scale(1.1)" fill="#ffc94d" />
      <path d={sparkle} transform="translate(520 340) scale(0.9)" fill="#ff6f9c" />
      <path d={sparkle} transform="translate(166 40) scale(0.8)" fill="#5fd3ad" />
    </svg>
  );
}
