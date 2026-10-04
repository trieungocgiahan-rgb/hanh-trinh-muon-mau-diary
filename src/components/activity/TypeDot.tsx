export function TypeDot({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 shrink-0 rounded-full shadow-[inset_0_1px_0_oklch(1_0_0/0.4)] ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
