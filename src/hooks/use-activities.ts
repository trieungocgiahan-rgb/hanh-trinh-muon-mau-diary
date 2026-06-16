import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ActivityRow, AttachmentRow } from "@/lib/activity-constants";

export interface ActivityWithExtras extends ActivityRow {
  author_name: string | null;
  attachments: AttachmentRow[];
  like_count: number;
  comment_count: number;
  attendance_count: number;
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

      const [{ data: atts }, { data: profiles }, { data: likes }, { data: comments }, { data: attend }] =
        await Promise.all([
          supabase.from("attachments").select("*").in("activity_id", ids),
          supabase.from("profiles").select("id, full_name").in("id", authorIds),
          supabase.from("activity_likes").select("activity_id").in("activity_id", ids),
          supabase.from("activity_comments").select("activity_id").in("activity_id", ids),
          supabase.from("activity_attendance").select("activity_id").in("activity_id", ids),
        ]);

      const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
      const attMap = new Map<string, AttachmentRow[]>();
      (atts ?? []).forEach((a) => {
        const arr = attMap.get(a.activity_id) ?? [];
        arr.push(a);
        attMap.set(a.activity_id, arr);
      });

      const countBy = (rows: { activity_id: string }[] | null) => {
        const m = new Map<string, number>();
        (rows ?? []).forEach((r) => m.set(r.activity_id, (m.get(r.activity_id) ?? 0) + 1));
        return m;
      };
      const likeMap = countBy(likes);
      const commentMap = countBy(comments);
      const attendMap = countBy(attend);

      return rows.map((r) => ({
        ...r,
        author_name: nameMap.get(r.author_id) ?? null,
        attachments: attMap.get(r.id) ?? [],
        like_count: likeMap.get(r.id) ?? 0,
        comment_count: commentMap.get(r.id) ?? 0,
        attendance_count: attendMap.get(r.id) ?? 0,
      }));
    },
  });
}
