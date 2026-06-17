import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Use the locally-stored session (instant, no network) so a transient
    // network blip never kicks a signed-in user back to /auth. RLS still
    // validates every request server-side.
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
    return { user: data.session.user };
  },

  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
