-- ============ ENUMS ============
CREATE TYPE public.project_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE public.activity_type AS ENUM ('workshop', 'team_meeting', 'partner_meeting', 'site_visit', 'event', 'other');
CREATE TYPE public.activity_status AS ENUM ('completed', 'ongoing', 'planned', 'issue');
CREATE TYPE public.attachment_kind AS ENUM ('photo', 'audio', 'video', 'document', 'link');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ ORGANIZATIONS ============
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- ============ MEMBERSHIPS ============
CREATE TABLE public.memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.project_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ ACTIVITIES ============
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  type public.activity_type NOT NULL DEFAULT 'other',
  status public.activity_status NOT NULL DEFAULT 'planned',
  location text,
  participant_count integer,
  summary text,
  highlight text,
  issues text,
  next_steps text,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_activities_project_date ON public.activities(project_id, date);

-- ============ ATTACHMENTS ============
CREATE TABLE public.attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  kind public.attachment_kind NOT NULL,
  storage_path text,
  url text,
  file_name text,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attachments TO authenticated;
GRANT ALL ON public.attachments TO service_role;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_attachments_activity ON public.attachments(activity_id);

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE project_id = _project_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_admin(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE project_id = _project_id AND user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_project_role(_project_id uuid)
RETURNS public.project_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.memberships
  WHERE project_id = _project_id AND user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.projects p ON p.id = m.project_id
    WHERE p.org_id = _org_id AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.projects p ON p.id = m.project_id
    WHERE p.org_id = _org_id AND m.user_id = auth.uid() AND m.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.shares_project_with(_other_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships a
    JOIN public.memberships b ON a.project_id = b.project_id
    WHERE a.user_id = auth.uid() AND b.user_id = _other_user
  );
$$;

CREATE OR REPLACE FUNCTION public.activity_in_my_project(_activity_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.memberships m ON m.project_id = a.project_id
    WHERE a.id = _activity_id AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_write_activity_attachment(_activity_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.memberships m ON m.project_id = a.project_id
    WHERE a.id = _activity_id AND m.user_id = auth.uid()
      AND (m.role = 'admin' OR (m.role = 'member' AND a.author_id = auth.uid()))
  );
$$;

-- ============ RLS POLICIES ============
-- organizations
CREATE POLICY "Members can view their orgs" ON public.organizations
  FOR SELECT USING (public.is_org_member(id));
CREATE POLICY "Org admins can update orgs" ON public.organizations
  FOR UPDATE USING (public.is_org_admin(id));
CREATE POLICY "Authenticated can create orgs" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- projects
CREATE POLICY "Members can view their projects" ON public.projects
  FOR SELECT USING (public.is_project_member(id));
CREATE POLICY "Org admins can create projects" ON public.projects
  FOR INSERT WITH CHECK (public.is_org_admin(org_id));
CREATE POLICY "Project admins can update projects" ON public.projects
  FOR UPDATE USING (public.is_project_admin(id));
CREATE POLICY "Project admins can delete projects" ON public.projects
  FOR DELETE USING (public.is_project_admin(id));

-- memberships
CREATE POLICY "Members can view team memberships" ON public.memberships
  FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Admins can add members" ON public.memberships
  FOR INSERT WITH CHECK (public.is_project_admin(project_id));
CREATE POLICY "Admins can update members" ON public.memberships
  FOR UPDATE USING (public.is_project_admin(project_id));
CREATE POLICY "Admins can remove members" ON public.memberships
  FOR DELETE USING (public.is_project_admin(project_id));

-- profiles
CREATE POLICY "View own or teammate profiles" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.shares_project_with(id));
CREATE POLICY "Insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- activities
CREATE POLICY "Members can view activities" ON public.activities
  FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Admins and members can create activities" ON public.activities
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND public.user_project_role(project_id) IN ('admin', 'member')
  );
CREATE POLICY "Admins or owners can update activities" ON public.activities
  FOR UPDATE USING (
    public.is_project_admin(project_id)
    OR (public.user_project_role(project_id) = 'member' AND author_id = auth.uid())
  );
CREATE POLICY "Admins or owners can delete activities" ON public.activities
  FOR DELETE USING (
    public.is_project_admin(project_id)
    OR (public.user_project_role(project_id) = 'member' AND author_id = auth.uid())
  );

-- attachments
CREATE POLICY "Members can view attachments" ON public.attachments
  FOR SELECT USING (public.activity_in_my_project(activity_id));
CREATE POLICY "Writers can add attachments" ON public.attachments
  FOR INSERT WITH CHECK (public.can_write_activity_attachment(activity_id));
CREATE POLICY "Writers can delete attachments" ON public.attachments
  FOR DELETE USING (public.can_write_activity_attachment(activity_id));

-- ============ NEW USER TRIGGER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  seed_project uuid;
  has_admin boolean;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

  -- pick the earliest project as the seed project
  SELECT id INTO seed_project FROM public.projects ORDER BY created_at ASC LIMIT 1;

  IF seed_project IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.memberships WHERE project_id = seed_project AND role = 'admin'
    ) INTO has_admin;

    INSERT INTO public.memberships (project_id, user_id, role)
    VALUES (seed_project, NEW.id, CASE WHEN has_admin THEN 'member'::public.project_role ELSE 'admin'::public.project_role END)
    ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEED DATA ============
INSERT INTO public.organizations (id, name)
VALUES ('11111111-1111-1111-1111-111111111111', 'Nét Mơ');

INSERT INTO public.projects (id, org_id, name, description)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Season 2 — Chuyện của Mây',
  'Hành trình mùa 2 của dự án cộng đồng Nét Mơ.'
);