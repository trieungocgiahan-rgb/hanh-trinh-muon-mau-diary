import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ActivityRow, AttachmentRow } from "@/lib/activity-constants";

export interface ActivityWithExtras extends ActivityRow {
  author_name: string | null;
  attachments: AttachmentRow[];
}

export function useActivities(projectId: string | undefined) {
  return useQuery({
    queryKey: ["activities", projectId],
    enabled: !!projectId,
    queryFn: async (): Promise<ActivityWithExtras[]> => {
      const { data: activities, error } = await supabase
        .from("activities")
        .select("*")
        .eq("project_id", projectId!)
        .order("date", { ascending: false });
      if (error) throw error;
      const rows = activities ?? [];
      if (rows.length === 0) return [];

      const ids = rows.map((r) => r.id);
      const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));

      const [{ data: atts }, { data: profiles }] = await Promise.all([
        supabase.from("attachments").select("*").in("activity_id", ids),
        supabase.from("profiles").select("id, full_name").in("id", authorIds),
      ]);

      const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
      const attMap = new Map<string, AttachmentRow[]>();
      (atts ?? []).forEach((a) => {
        const arr = attMap.get(a.activity_id) ?? [];
        arr.push(a);
        attMap.set(a.activity_id, arr);
      });

      return rows.map((r) => ({
        ...r,
        author_name: nameMap.get(r.author_id) ?? null,
        attachments: attMap.get(r.id) ?? [],
      }));
    },
  });
}
