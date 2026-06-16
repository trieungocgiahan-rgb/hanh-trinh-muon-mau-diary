-- Helper: can the current user interact (like/comment/check-in/contribute) on an activity?
CREATE OR REPLACE FUNCTION public.can_interact_activity(_activity_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.memberships m ON m.project_id = a.project_id
    WHERE a.id = _activity_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin', 'member')
  );
$$;

-- Helper: is the current user an admin of the activity's project?
CREATE OR REPLACE FUNCTION public.is_admin_of_activity(_activity_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.memberships m ON m.project_id = a.project_id
    WHERE a.id = _activity_id
      AND m.user_id = auth.uid()
      AND m.role = 'admin'
  );
$$;

-- ============ attachments: attribute contributed media ============
ALTER TABLE public.attachments
  ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;

-- backfill existing attachments to the owning activity's author
UPDATE public.attachments att
SET created_by = a.author_id
FROM public.activities a
WHERE att.activity_id = a.id AND att.created_by IS NULL;

-- loosen write policies so any project member (admin/member) can contribute media
DROP POLICY IF EXISTS "Writers can add attachments" ON public.attachments;
CREATE POLICY "Members can add attachments"
ON public.attachments FOR INSERT TO authenticated
WITH CHECK (public.can_interact_activity(activity_id) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Writers can delete attachments" ON public.attachments;
CREATE POLICY "Uploader owner or admin can delete attachments"
ON public.attachments FOR DELETE TO authenticated
USING (
  created_by = auth.uid()
  OR public.is_admin_of_activity(activity_id)
  OR EXISTS (
    SELECT 1 FROM public.activities a
    WHERE a.id = attachments.activity_id AND a.author_id = auth.uid()
  )
);

-- ============ activity_likes ============
CREATE TABLE public.activity_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_likes TO authenticated;
GRANT ALL ON public.activity_likes TO service_role;
ALTER TABLE public.activity_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view likes"
ON public.activity_likes FOR SELECT TO authenticated
USING (public.activity_in_my_project(activity_id));

CREATE POLICY "Members can like"
ON public.activity_likes FOR INSERT TO authenticated
WITH CHECK (public.can_interact_activity(activity_id) AND user_id = auth.uid());

CREATE POLICY "Users can unlike their own"
ON public.activity_likes FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ============ activity_attendance ============
CREATE TABLE public.activity_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_attendance TO authenticated;
GRANT ALL ON public.activity_attendance TO service_role;
ALTER TABLE public.activity_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view attendance"
ON public.activity_attendance FOR SELECT TO authenticated
USING (public.activity_in_my_project(activity_id));

CREATE POLICY "Members can check in"
ON public.activity_attendance FOR INSERT TO authenticated
WITH CHECK (public.can_interact_activity(activity_id) AND user_id = auth.uid());

CREATE POLICY "Users can remove their own check-in"
ON public.activity_attendance FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ============ activity_comments ============
CREATE TABLE public.activity_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_comments TO authenticated;
GRANT ALL ON public.activity_comments TO service_role;
ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view comments"
ON public.activity_comments FOR SELECT TO authenticated
USING (public.activity_in_my_project(activity_id));

CREATE POLICY "Members can comment"
ON public.activity_comments FOR INSERT TO authenticated
WITH CHECK (public.can_interact_activity(activity_id) AND user_id = auth.uid());

CREATE POLICY "Authors can edit their comment"
ON public.activity_comments FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Author or admin can delete comment"
ON public.activity_comments FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.is_admin_of_activity(activity_id));

CREATE TRIGGER update_activity_comments_updated_at
BEFORE UPDATE ON public.activity_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();