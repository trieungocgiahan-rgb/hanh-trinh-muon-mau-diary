import { useEffect, useState } from "react";
import { getSignedUrl } from "@/lib/media";
import { Loader2, FileText, Play, Pause } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function useSignedUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    getSignedUrl(path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path]);
  return url;
}

export function SignedImage({
  path,
  alt,
  className,
  onClick,
}: {
  path: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  const url = useSignedUrl(path);
  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className ?? ""}`}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return <img src={url} alt={alt} loading="lazy" onClick={onClick} className={className} />;
}

export function SignedAudio({ path }: { path: string }) {
  const { t } = useI18n();
  const url = useSignedUrl(path);
  if (!url) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-full bg-muted px-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {t("media.loadingAudio")}
      </div>
    );
  }
  return <audio controls src={url} className="h-10 w-full" />;
}

export function SignedVideo({ path }: { path: string }) {
  const url = useSignedUrl(path);
  if (!url) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return <video controls src={url} className="w-full rounded-xl" />;
}

export function SignedDocLink({ path, fileName }: { path: string; fileName: string | null }) {
  const { t } = useI18n();
  const url = useSignedUrl(path);
  const className =
    "flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground";
  if (!url) {
    return (
      <span className={`${className} opacity-70`} aria-busy>
        <FileText className="h-4 w-4 text-primary" />
        <span className="truncate">{fileName ?? t("attach.docs")}</span>
        <Loader2 className="ml-auto h-3 w-3 animate-spin" />
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`${className} transition-colors hover:bg-accent`}
    >
      <FileText className="h-4 w-4 text-primary" />
      <span className="truncate">{fileName ?? t("attach.docs")}</span>
    </a>
  );
}

export { Play, Pause };
