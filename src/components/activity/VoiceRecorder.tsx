import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

interface Props {
  onRecorded: (blob: Blob, durationSec: number) => void;
}

export function VoiceRecorder({ onRecorded }: Props) {
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        onRecorded(blob, seconds);
        stream.getTracks().forEach((t) => t.stop());
        setSeconds(0);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error(t("voice.micFail"), {
        description: t("voice.micFailDesc"),
      });
    }
  }

  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-3">
      {recording ? (
        <>
          <Button type="button" variant="destructive" size="sm" onClick={stop}>
            <Square className="h-4 w-4" /> {t("voice.stop")}
          </Button>
          <span className="flex items-center gap-2 text-sm font-medium text-destructive">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
            {mm}:{ss}
          </span>
        </>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={start}>
          <Mic className="h-4 w-4" /> {t("voice.record")}
        </Button>
      )}
    </div>
  );
}

export function PendingAudioPreview({ blob, onRemove }: { blob: Blob; onRemove: () => void }) {
  const url = URL.createObjectURL(blob);
  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
      <audio controls src={url} className="h-9 flex-1" />
      <button type="button" onClick={onRemove} className="text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
