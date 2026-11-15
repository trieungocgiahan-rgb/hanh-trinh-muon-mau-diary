import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

// Biểu tượng thương hiệu: hai vòng tròn giao nhau (hai người, một câu chuyện) trên nền màu chủ đạo.
// Vẽ bằng SVG nên luôn sắc nét và đổi theo màu của từng dự án.
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label={BRAND}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className ?? "h-9 w-9",
      )}
    >
      <svg viewBox="0 0 32 32" className="h-[62%] w-[62%]" fill="none" aria-hidden>
        <circle cx="12" cy="16" r="7" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="20" cy="16" r="7" stroke="currentColor" strokeWidth="2.6" opacity="0.7" />
      </svg>
    </span>
  );
}
