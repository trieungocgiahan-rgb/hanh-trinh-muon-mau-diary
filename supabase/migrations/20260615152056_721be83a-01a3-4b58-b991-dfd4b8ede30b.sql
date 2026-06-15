-- Lock down SECURITY DEFINER helper execution to authenticated users only
REVOKE EXECUTE ON FUNCTION public.is_project_member(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_project_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.user_project_role(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_org_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.shares_project_with(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.activity_in_my_project(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.can_write_activity_attachment(uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.is_project_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_project_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_project_with(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activity_in_my_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_activity_attachment(uuid) TO authenticated;

-- Helper: is the first path segment a project the user belongs to?
CREATE OR REPLACE FUNCTION public.storage_path_project_member(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
      AND project_id = NULLIF((string_to_array(_name, '/'))[1], '')::uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.storage_path_project_writer(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
      AND project_id = NULLIF((string_to_array(_name, '/'))[1], '')::uuid
      AND role IN ('admin', 'member')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.storage_path_project_member(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.storage_path_project_writer(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.storage_path_project_member(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.storage_path_project_writer(text) TO authenticated;

-- Storage RLS policies for the private "media" bucket
CREATE POLICY "Members can view media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.storage_path_project_member(name));

CREATE POLICY "Writers can upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.storage_path_project_writer(name));

CREATE POLICY "Writers can delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.storage_path_project_writer(name));