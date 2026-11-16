import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

// Hai vòng tròn chồng nhau: hồng (người này) và cam (người kia). Chỗ giao là câu chuyện chung.
function Rings({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-1.5 -1 23.5 20" className={className} style={style} fill="none" aria-hidden>
      <circle cx="8.6" cy="9" r="7.6" stroke="var(--primary)" strokeWidth="3.6" />
      <circle cx="13.6" cy="9" r="7.6" stroke="var(--tang)" strokeWidth="3.6" style={{ mixBlendMode: "multiply" }} />
    </svg>
  );
}

// Biểu tượng riêng (menu, thanh bên, trang đăng nhập)
export function BrandMark({ className }: { className?: string }) {
  return (
    <span role="img" aria-label={BRAND} className={cn("inline-flex shrink-0 items-center justify-center", className ?? "h-9 w-9")}>
      <Rings className="h-auto w-full" />
    </span>
  );
}

// Logo chữ: "together" viết thường, chữ o là hai vòng tròn giao nhau.
// `bang` thêm dấu chấm than cuối nếu muốn: together!
export function Wordmark({
  className,
  bang = false,
}: {
  className?: string;
  bang?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={BRAND}
      className={cn("inline-flex items-baseline whitespace-nowrap font-display font-semibold leading-none tracking-[-0.03em]", className ?? "text-2xl")}
    >
      <span aria-hidden>t</span>
      <Rings className="mx-[0.05em] h-[0.6em] w-auto self-baseline" />
      <span aria-hidden>gether</span>
      {bang && (
        <span aria-hidden className="text-primary">
          !
        </span>
      )}
    </span>
  );
}
