-- Tùy biến giao diện theo từng dự án: màu chủ đạo và ảnh bìa
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'coral',
  ADD COLUMN IF NOT EXISTS cover_path text;

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_theme_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_theme_check
  CHECK (theme IN ('coral', 'sunset', 'forest', 'ocean', 'grape', 'rose'));