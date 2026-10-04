-- Người mới tự chọn: nhập mã mời để vào dự án có sẵn, hoặc tạo dự án mới.

-- 1. Mã mời 8 ký tự (bỏ các ký tự dễ nhầm như 0/O, 1/I), sinh từ nguồn ngẫu nhiên mật mã học
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  h text;
  i int;
BEGIN
  LOOP
    h := replace(gen_random_uuid()::text, '-', '');
    code := '';
    FOR i IN 0..7 LOOP
      code := code || substr(alphabet, 1 + (get_byte(decode(substr(h, 1 + 2 * i, 2), 'hex'), 0) % 32), 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.projects WHERE invite_code = code);
  END LOOP;
  RETURN code;
END;
$$;

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS invite_code text;
UPDATE public.projects SET invite_code = public.generate_invite_code() WHERE invite_code IS NULL;
ALTER TABLE public.projects ALTER COLUMN invite_code SET DEFAULT public.generate_invite_code();
ALTER TABLE public.projects ALTER COLUMN invite_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS projects_invite_code_key ON public.projects (invite_code);

-- 2. Người mới đăng ký không còn bị tự xếp vào dự án đầu tiên
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Tham gia dự án bằng mã: vào trạng thái "chờ duyệt", quản trị viên duyệt như trước
CREATE OR REPLACE FUNCTION public.join_project_by_code(_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  norm text := upper(regexp_replace(coalesce(_code, ''), '[^A-Za-z0-9]', '', 'g'));
  pid uuid;
  current_role_value public.project_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT id INTO pid FROM public.projects WHERE invite_code = norm;
  IF pid IS NULL THEN
    RAISE EXCEPTION 'invalid_code';
  END IF;

  SELECT role INTO current_role_value
  FROM public.memberships WHERE project_id = pid AND user_id = auth.uid();

  IF current_role_value IS NOT NULL THEN
    RETURN current_role_value::text;
  END IF;

  INSERT INTO public.memberships (project_id, user_id, role)
  VALUES (pid, auth.uid(), 'pending');
  RETURN 'pending';
END;
$$;

-- 4. Tạo tổ chức + dự án mới, người tạo là quản trị viên (giới hạn 5 dự án / người để tránh spam)
CREATE OR REPLACE FUNCTION public.create_project_with_org(_org_name text, _name text, _description text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  org uuid;
  pid uuid;
  org_label text := nullif(btrim(coalesce(_org_name, '')), '');
  proj_label text := btrim(coalesce(_name, ''));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF char_length(proj_label) < 1 OR char_length(proj_label) > 120 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;
  IF org_label IS NOT NULL AND char_length(org_label) > 120 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;
  IF (SELECT count(*) FROM public.memberships WHERE user_id = auth.uid() AND role = 'admin') >= 5 THEN
    RAISE EXCEPTION 'too_many_projects';
  END IF;

  INSERT INTO public.organizations (name)
  VALUES (coalesce(org_label, proj_label))
  RETURNING id INTO org;

  INSERT INTO public.projects (org_id, name, description)
  VALUES (org, proj_label, nullif(btrim(coalesce(_description, '')), ''))
  RETURNING id INTO pid;

  INSERT INTO public.memberships (project_id, user_id, role)
  VALUES (pid, auth.uid(), 'admin');
  RETURN pid;
END;
$$;

-- 5. Quản trị viên đổi mã mời khi lỡ lộ
CREATE OR REPLACE FUNCTION public.regenerate_invite_code(_project_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code text;
BEGIN
  IF NOT public.is_project_admin(_project_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  new_code := public.generate_invite_code();
  UPDATE public.projects SET invite_code = new_code WHERE id = _project_id;
  RETURN new_code;
END;
$$;

-- 6. Chỉ người đã đăng nhập mới gọi được
REVOKE ALL ON FUNCTION public.join_project_by_code(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_project_with_org(text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.regenerate_invite_code(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_project_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_project_with_org(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.regenerate_invite_code(uuid) TO authenticated;
