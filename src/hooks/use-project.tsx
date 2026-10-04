import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import type { ProjectRole } from "@/lib/activity-constants";

export interface ProjectInfo {
  id: string;
  name: string;
  description: string | null;
  org_id: string;
  org_name: string;
  role: ProjectRole;
}

interface ProjectQueryResult {
  projects: ProjectInfo[];
  pendingApproval: boolean;
}

interface ProjectContextValue {
  projects: ProjectInfo[];
  current: ProjectInfo | null;
  setCurrentId: (id: string) => void;
  loading: boolean;
  canEdit: boolean; // admin or member
  isAdmin: boolean;
  pendingApproval: boolean;
  needsOnboarding: boolean; // chưa thuộc dự án nào và cũng chưa xin vào dự án nào
}

const ProjectContext = createContext<ProjectContextValue>({
  projects: [],
  current: null,
  setCurrentId: () => {},
  loading: true,
  canEdit: false,
  isAdmin: false,
  pendingApproval: false,
  needsOnboarding: false,
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentId, setCurrentId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-projects", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ProjectQueryResult> => {
      if (!user) return { projects: [], pendingApproval: false };
      const { data, error } = await supabase
        .from("memberships")
        .select("role, project:projects(id, name, description, org_id, organizations(name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const rows = data ?? [];
      const seen = new Set<string>();
      const projects = rows
        .filter((m) => m.project)
        .filter((m) => {
          const id = (m.project as unknown as { id: string }).id;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .map((m) => {
          const p = m.project as unknown as {
            id: string;
            name: string;
            description: string | null;
            org_id: string;
            organizations: { name: string } | null;
          };
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            org_id: p.org_id,
            org_name: p.organizations?.name ?? "",
            role: m.role,
          };
        });

      // A pending user has a membership row but RLS hides the project,
      // so it never appears in `projects`.
      const pendingApproval = projects.length === 0 && rows.some((m) => m.role === "pending");

      return { projects, pendingApproval };
    },
  });

  const projects = data?.projects ?? [];
  const pendingApproval = data?.pendingApproval ?? false;
  const current = useMemo(
    () => projects.find((p) => p.id === currentId) ?? projects[0] ?? null,
    [projects, currentId],
  );

  const value: ProjectContextValue = {
    projects,
    current,
    setCurrentId,
    loading: isLoading,
    canEdit: current?.role === "admin" || current?.role === "member",
    isAdmin: current?.role === "admin",
    pendingApproval,
    needsOnboarding: !isLoading && !!user && projects.length === 0 && !pendingApproval,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  return useContext(ProjectContext);
}
