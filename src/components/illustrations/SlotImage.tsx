import { useEffect, useRef, useState, type ReactNode } from "react";

// Ô ảnh: nếu có file trong public/images thì dùng, chưa có thì hiện hình vẽ tạm (fallback).
export function SlotImage({
  src,
  alt,
  fallback,
  className,
}: {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed) return <>{fallback}</>;
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
