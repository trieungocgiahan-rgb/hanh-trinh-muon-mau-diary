-- Exclude pending users from all project/org access checks
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE project_id = _project_id AND user_id = auth.uid()
      AND role <> 'pending'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.projects p ON p.id = m.project_id
    WHERE p.org_id = _org_id AND m.user_id = auth.uid()
      AND m.role <> 'pending'
  );
$function$;

CREATE OR REPLACE FUNCTION public.shares_project_with(_other_user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships a
    JOIN public.memberships b ON a.project_id = b.project_id
    WHERE a.user_id = auth.uid() AND b.user_id = _other_user
      AND a.role <> 'pending' AND b.role <> 'pending'
  );
$function$;

CREATE OR REPLACE FUNCTION public.storage_path_project_member(_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
      AND project_id = NULLIF((string_to_array(_name, '/'))[1], '')::uuid
      AND role <> 'pending'
  );
$function$;

-- New sign-ups (after first admin) become pending
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  seed_project uuid;
  has_admin boolean;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

  SELECT id INTO seed_project FROM public.projects ORDER BY created_at ASC LIMIT 1;

  IF seed_project IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.memberships WHERE project_id = seed_project AND role = 'admin'
    ) INTO has_admin;

    INSERT INTO public.memberships (project_id, user_id, role)
    VALUES (seed_project, NEW.id, CASE WHEN has_admin THEN 'pending'::public.project_role ELSE 'admin'::public.project_role END)
    ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Allow a user to read their own membership row (to detect pending state)
CREATE POLICY "Users can view own membership"
ON public.memberships
FOR SELECT
TO authenticated
USING (user_id = auth.uid());