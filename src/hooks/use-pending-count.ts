import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/use-project";

// Số người đang chờ duyệt; chỉ quản trị viên mới thấy được.
export function usePendingCount() {
  const { current, isAdmin } = useProject();
  const { data } = useQuery({
    queryKey: ["members-pending", current?.id],
    enabled: !!current && isAdmin,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("memberships")
        .select("id", { count: "exact", head: true })
        .eq("project_id", current!.id)
        .eq("role", "pending");
      if (error) throw error;
      return count ?? 0;
    },
  });
  return isAdmin ? (data ?? 0) : 0;
}
