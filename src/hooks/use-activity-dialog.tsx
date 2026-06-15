import { createContext, useContext, useState, type ReactNode } from "react";
import type { ActivityWithExtras } from "@/hooks/use-activities";

interface ActivityDialogState {
  openCreate: (presetDate?: string) => void;
  openEdit: (activity: ActivityWithExtras) => void;
  openDetail: (activity: ActivityWithExtras) => void;
  closeAll: () => void;
  // internal state consumed by the dialogs renderer
  createOpen: boolean;
  presetDate?: string;
  editing: ActivityWithExtras | null;
  detail: ActivityWithExtras | null;
  setCreateOpen: (v: boolean) => void;
  setEditing: (a: ActivityWithExtras | null) => void;
  setDetail: (a: ActivityWithExtras | null) => void;
}

const Ctx = createContext<ActivityDialogState | null>(null);

export function ActivityDialogProvider({ children }: { children: ReactNode }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [presetDate, setPresetDate] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<ActivityWithExtras | null>(null);
  const [detail, setDetail] = useState<ActivityWithExtras | null>(null);

  const value: ActivityDialogState = {
    createOpen,
    presetDate,
    editing,
    detail,
    setCreateOpen,
    setEditing,
    setDetail,
    openCreate: (d) => {
      setPresetDate(d);
      setEditing(null);
      setCreateOpen(true);
    },
    openEdit: (a) => {
      setDetail(null);
      setEditing(a);
      setCreateOpen(true);
    },
    openDetail: (a) => setDetail(a),
    closeAll: () => {
      setCreateOpen(false);
      setEditing(null);
      setDetail(null);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActivityDialog() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useActivityDialog must be used within ActivityDialogProvider");
  return ctx;
}
