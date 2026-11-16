import { cn } from "@/lib/utils";

// Avatar chữ cái đầu, màu theo tên (cùng tên thì luôn cùng màu).
const TONES = [
  "bg-primary text-primary-foreground",
  "bg-azure text-white",
  "bg-amber text-[oklch(0.3_0.06_80)]",
  "bg-tang text-[oklch(0.3_0.07_45)]",
  "bg-[oklch(0.62_0.11_160)] text-white",
  "bg-[oklch(0.56_0.15_27)] text-white",
] as const;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function PersonAvatar({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const label = (name ?? "?").trim() || "?";
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        TONES[hash(label) % TONES.length],
        className,
      )}
    >
      {label.charAt(0).toUpperCase()}
    </span>
  );
}
