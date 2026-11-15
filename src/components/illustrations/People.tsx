import type { ReactNode } from "react";

// Nhân vật vẽ bằng SVG thuần (không ảnh), dùng cho hình minh họa "cả đội kết nối".
// Gốc tọa độ nằm ở chân cổ; đầu ở phía trên, thân kéo dài xuống dưới.

export type HairStyle = "short" | "long" | "bun" | "curly";

export interface PersonProps {
  x: number;
  y: number;
  scale?: number;
  skin: string;
  hair: string;
  style: HairStyle;
  top: string;
  wave?: boolean;
  delay?: number;
}

const INK = "#3a2530";

function Hair({ style, hair }: { style: HairStyle; hair: string }): ReactNode {
  const cap = "M-25 -32 C-27 -64 27 -64 25 -32 C20 -48 6 -52 -4 -48 C-14 -46 -22 -42 -25 -32Z";
  switch (style) {
    case "long":
      return (
        <>
          <path d="M-29 -34 C-31 -70 31 -70 29 -34 L33 16 L-33 16 Z" fill={hair} />
        </>
      );
    case "curly":
      return (
        <g fill={hair}>
          <circle cx="-19" cy="-50" r="13" />
          <circle cx="0" cy="-58" r="15" />
          <circle cx="19" cy="-50" r="13" />
          <circle cx="-27" cy="-34" r="9" />
          <circle cx="27" cy="-34" r="9" />
        </g>
      );
    case "bun":
      return <circle cx="0" cy="-64" r="11" fill={hair} />;
    default:
      return <path d={cap} fill={hair} />;
  }
}

function Fringe({ style, hair }: { style: HairStyle; hair: string }): ReactNode {
  if (style === "curly") return null;
  return (
    <path
      d="M-25 -32 C-27 -64 27 -64 25 -32 C20 -48 6 -52 -4 -48 C-14 -46 -22 -42 -25 -32Z"
      fill={hair}
    />
  );
}

export function Person({ x, y, scale = 1, skin, hair, style, top, wave, delay = 0 }: PersonProps) {
  // thân kéo xuống đúng mép bàn (y = 420) cho mọi người
  const len = Math.max(60, (420 - y) / scale);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="ill-bob" style={{ animationDelay: `${delay}s` }}>
        {/* tóc phía sau */}
        {(style === "long" || style === "curly") && <Hair style={style} hair={hair} />}
        {/* thân */}
        <path d={`M-44 ${len} L-44 26 C-44 8 -26 0 0 0 C26 0 44 8 44 26 L44 ${len} Z`} fill={top} />
        {wave && (
          <g>
            <path
              d="M40 22 C66 12 72 -14 66 -40"
              stroke={top}
              strokeWidth="15"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="66" cy="-46" r="9" fill={skin} />
          </g>
        )}
        {/* cổ và đầu */}
        <rect x="-8" y="-12" width="16" height="18" rx="6" fill={skin} />
        <ellipse cx="0" cy="-32" rx="24" ry="26" fill={skin} />
        {style === "bun" && <Hair style="bun" hair={hair} />}
        {style !== "curly" && style !== "bun" && style !== "long" && <Hair style={style} hair={hair} />}
        {(style === "long" || style === "bun") && <Fringe style={style} hair={hair} />}
        {/* mặt */}
        <circle cx="-9" cy="-30" r="2.7" fill={INK} />
        <circle cx="9" cy="-30" r="2.7" fill={INK} />
        <path d="M-8 -20 Q0 -12 8 -20" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="-16" cy="-22" r="4.2" fill="#ff7fa3" opacity="0.5" />
        <circle cx="16" cy="-22" r="4.2" fill="#ff7fa3" opacity="0.5" />
      </g>
    </g>
  );
}

const SKINS = ["#f4cfae", "#d9a37d", "#a9714f", "#f7d9c4", "#8a5a3c"];
const HAIRS = ["#3a2530", "#e0537f", "#7a4a2e", "#f0b84a", "#2f2a45"];
const TOPS = ["#ff6f9c", "#ffc94d", "#5fd3ad", "#a68bff", "#62a8ff"];

// Hàng avatar nhỏ chồng lên nhau, dùng ở huy hiệu và dải kêu gọi.
export function AvatarStack({ className = "h-9", ring = "var(--card)" }: { className?: string; ring?: string }) {
  const items = [0, 1, 2, 3];
  return (
    <svg viewBox="0 0 150 44" className={className} role="img" aria-hidden>
      {items.map((i) => (
        <g key={i} transform={`translate(${22 + i * 35} 22)`}>
          <circle r="21" fill={TOPS[i]} stroke={ring} strokeWidth="3" />
          <clipPath id={`av-${i}`}>
            <circle r="19" />
          </clipPath>
          <g clipPath={`url(#av-${i})`}>
            <path d="M-22 24 C-22 8 -10 6 0 6 C10 6 22 8 22 24Z" fill={TOPS[(i + 2) % 5]} />
            <ellipse cx="0" cy="-3" rx="10" ry="11" fill={SKINS[i % 5]} />
            <path d="M-11 -5 C-12 -17 12 -17 11 -5 C8 -11 -4 -13 -11 -5Z" fill={HAIRS[i % 5]} />
            <circle cx="-3.6" cy="-2" r="1.2" fill={INK} />
            <circle cx="3.6" cy="-2" r="1.2" fill={INK} />
            <path d="M-3 3 Q0 6 3 3" stroke={INK} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </g>
        </g>
      ))}
    </svg>
  );
}

export { SKINS, HAIRS, TOPS };
