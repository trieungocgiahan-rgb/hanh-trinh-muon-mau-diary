import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { applyThemeVars, clearThemeVars, themeHue } from "@/lib/project-themes";

// Đọc riêng và chịu lỗi: nếu máy chủ chưa có cột theme/cover_path thì dùng mặc định.
export function useProjectBranding(projectId: string | undefined) {
  const { data } = useQuery({
    queryKey: ["branding", projectId],
    enabled: !!projectId,
    retry: false,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("theme, cover_path")
        .eq("id", projectId!)
        .maybeSingle();
      if (error || !data) return { theme: "coral", cover_path: null as string | null };
      return data;
    },
  });
  const theme = data?.theme ?? "coral";
  return { theme, coverPath: data?.cover_path ?? null, hue: themeHue(theme) };
}

// Đặt màu chủ đạo của dự án lên toàn trang; trả lại mặc định khi rời khỏi khung ứng dụng.
export function useApplyTheme(theme: string) {
  useEffect(() => {
    applyThemeVars(theme);
  }, [theme]);
  useEffect(() => {
    return () => {
      clearThemeVars();
    };
  }, []);
}
