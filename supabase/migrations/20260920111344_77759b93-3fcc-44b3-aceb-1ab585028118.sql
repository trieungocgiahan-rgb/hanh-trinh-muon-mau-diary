-- 1. Restrict pending approval/rejection to project admins
DROP POLICY IF EXISTS "Members can approve pending" ON public.memberships;
DROP POLICY IF EXISTS "Members can reject pending" ON public.memberships;

CREATE POLICY "Admins can approve pending"
ON public.memberships FOR UPDATE TO authenticated
USING (public.is_project_admin(project_id) AND role = 'pending'::public.project_role)
WITH CHECK (public.is_project_admin(project_id) AND role = 'member'::public.project_role);

CREATE POLICY "Admins can reject pending"
ON public.memberships FOR DELETE TO authenticated
USING (public.is_project_admin(project_id) AND role = 'pending'::public.project_role);

-- 2. Lock down SECURITY DEFINER helper functions
DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);
  END LOOP;
END $$;

-- Re-grant EXECUTE to authenticated only for helpers referenced by RLS/storage policies
GRANT EXECUTE ON FUNCTION public.is_project_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_project_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_project_with(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activity_in_my_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_interact_activity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_of_activity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.storage_path_project_member(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.storage_path_project_writer(text) TO authenticated;
