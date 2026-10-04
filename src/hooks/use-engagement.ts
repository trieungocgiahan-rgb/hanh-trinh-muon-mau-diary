import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { tNow } from "@/lib/i18n";

export interface PersonRef {
  user_id: string;
  name: string;
}

export interface CommentItem {
  id: string;
  user_id: string;
  name: string;
  body: string;
  created_at: string;
}

export interface EngagementData {
  likes: PersonRef[];
  attendance: PersonRef[];
  comments: CommentItem[];
  contributorNames: Record<string, string>;
}

export function useEngagement(activityId: string | undefined) {
  return useQuery({
    queryKey: ["engagement", activityId],
    enabled: !!activityId,
    queryFn: async (): Promise<EngagementData> => {
      const [{ data: likes }, { data: attend }, { data: comments }, { data: atts }] =
        await Promise.all([
          supabase.from("activity_likes").select("user_id").eq("activity_id", activityId!),
          supabase.from("activity_attendance").select("user_id").eq("activity_id", activityId!),
          supabase
            .from("activity_comments")
            .select("id, user_id, body, created_at")
            .eq("activity_id", activityId!)
            .order("created_at", { ascending: true }),
          supabase.from("attachments").select("created_by").eq("activity_id", activityId!),
        ]);

      const userIds = Array.from(
        new Set([
          ...(likes ?? []).map((l) => l.user_id),
          ...(attend ?? []).map((a) => a.user_id),
          ...(comments ?? []).map((c) => c.user_id),
          ...(atts ?? []).map((a) => a.created_by).filter((x): x is string => !!x),
        ]),
      );

      let nameMap = new Map<string, string>();
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        nameMap = new Map((profs ?? []).map((p) => [p.id, p.full_name ?? tNow("common.anonymous")]));
      }
      const name = (id: string) => nameMap.get(id) ?? tNow("common.anonymous");

      return {
        likes: (likes ?? []).map((l) => ({ user_id: l.user_id, name: name(l.user_id) })),
        attendance: (attend ?? []).map((a) => ({ user_id: a.user_id, name: name(a.user_id) })),
        comments: (comments ?? []).map((c) => ({
          id: c.id,
          user_id: c.user_id,
          name: name(c.user_id),
          body: c.body,
          created_at: c.created_at,
        })),
        contributorNames: Object.fromEntries(nameMap),
      };
    },
  });
}
