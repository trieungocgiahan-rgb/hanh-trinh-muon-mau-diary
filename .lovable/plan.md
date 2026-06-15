# Nhật Ký Hành Trình — Build Plan

A shared, cloud-based activity journal for community/social-impact projects. Multi-tenant from day one (Organization → Project → Activity), Vietnamese UI, private media, role-based access.

## 1. Backend (Lovable Cloud / Supabase)

I'll enable Lovable Cloud (managed Supabase — database, auth, storage) and build the schema below.

### Schema (tables in `public`)

```text
organizations
  id uuid pk
  name text            -- seed: "Nét Mơ"
  created_at timestamptz

projects
  id uuid pk
  org_id uuid -> organizations(id) on delete cascade
  name text            -- seed: "Season 2 — Chuyện của Mây"
  description text
  created_at timestamptz

memberships              -- a user's role within ONE project
  id uuid pk
  project_id uuid -> projects(id) on delete cascade
  user_id uuid -> auth.users(id) on delete cascade
  role project_role      -- enum: 'admin' | 'member' | 'viewer'
  created_at timestamptz
  unique (project_id, user_id)

profiles                 -- display info, auto-created on signup
  id uuid pk -> auth.users(id) on delete cascade
  full_name text
  created_at timestamptz

activities
  id uuid pk
  project_id uuid -> projects(id) on delete cascade
  title text not null
  date date not null
  type activity_type      -- enum: workshop | team_meeting | partner_meeting | site_visit | event | other
  status activity_status  -- enum: completed | ongoing | planned | issue
  location text
  participant_count int
  summary text            -- Diễn biến chính
  highlight text          -- Quote / Điểm nổi bật
  issues text             -- Vấn đề phát sinh
  next_steps text         -- Bước tiếp theo
  author_id uuid -> auth.users(id)   -- Người ghi
  created_at, updated_at timestamptz

attachments
  id uuid pk
  activity_id uuid -> activities(id) on delete cascade
  kind attachment_kind   -- enum: photo | audio | video | document | link
  storage_path text      -- bucket path (null for links)
  url text               -- external link (null for files)
  file_name text
  mime_type text
  created_at timestamptz
```

Enums: `project_role`, `activity_type`, `activity_status`, `attachment_kind`.

### Security-definer helper functions

To avoid recursive RLS and centralize permission checks:

```text
public.user_project_role(_project_id uuid) returns project_role  -- security definer
public.is_project_member(_project_id uuid) returns boolean
public.is_project_admin(_project_id uuid) returns boolean
```

### RLS policies (every table RLS-enabled, with GRANTs to authenticated/service_role)

```text
organizations
  SELECT: user is a member of at least one project in this org
  ALL (write): is_project_admin of a project in this org

projects
  SELECT: is_project_member(id)
  INSERT/UPDATE/DELETE: is_project_admin(id)

memberships
  SELECT: is_project_member(project_id)            -- members see their team
  INSERT/UPDATE/DELETE: is_project_admin(project_id)  -- only admins manage members/roles

profiles
  SELECT: own row OR shares a project with the target user
  UPDATE: own row only

activities
  SELECT: is_project_member(project_id)            -- admin, member, viewer all read
  INSERT: role in (admin, member) AND author_id = auth.uid()
  UPDATE/DELETE: is_project_admin(project_id) OR (role = member AND author_id = auth.uid())
                 -- viewers can never write; members only their own

attachments
  SELECT: member of the parent activity's project
  INSERT/DELETE: admin of project, OR member who owns the parent activity
```

A trigger creates a `profiles` row on new `auth.users` signup.

### Private storage

One **private** bucket `media` (photos, audio, video, documents). No public access. Files keyed by `project_id/activity_id/uuid-filename`. RLS on `storage.objects`:

```text
SELECT/INSERT/DELETE allowed only when the path's project_id is one the user
is a member of (write requires admin or owning member).
```

The app fetches files via short-lived **signed URLs** generated server-side (server function) — never public URLs. This keeps photos of children/elderly confidential.

### Seeding

Migration seeds org "Nét Mơ" + project "Season 2 — Chuyện của Mây". The first user to sign up is auto-assigned **admin** of the seed project (via a one-time server function / trigger), so you can start logging immediately. Additional members are invited by admins.

## 2. Auth

Email/password + Google sign-in (Lovable defaults). `_authenticated` route gate for the app; public `/auth` page. Sign-up captures full name into `profiles`.

## 3. Frontend (React + Tailwind + shadcn)

- **Design system first** in `src/styles.css`: bright youthful palette (warm coral/peach, sunny yellow, friendly purple, soft mint on off-white), rounded corners, soft shadows, oklch tokens, gradients. Characterful display font for titles (e.g. Baloo 2 / Fredoka) + legible sans (e.g. Be Vietnam Pro for full Vietnamese diacritics) — body uses a Vietnamese-friendly font.
- **Calendar view (main screen)** — monthly grid, activities color-coded by type, click day/activity → detail sheet. Toggle to list/timeline view.
- **Quick logging** — prominent "+ Ghi hoạt động" button → activity form (all fields above), mobile-first.
- **Attachments**: drag-drop multi-photo upload + thumbnail gallery with lightbox; in-browser voice recording (MediaRecorder) + audio upload + inline playback; video & PDF/Word upload; external link paste.
- **Activity detail** — highlight quote shown prominently; smooth open transition; cheerful save toast.
- **Search & filter** — by title/location/quote; filter by type & status.
- **Dashboard stats** — total activities, workshops, total participants, completed count.
- **Export report** — generate a downloadable Markdown report (overview stats + each activity detailed) for advisors/sponsors.
- Fully responsive, Vietnamese throughout (labels, buttons, empty states).

## 4. Technical notes

- Media access via `createServerFn` (signed URLs, authenticated). Uploads via authenticated browser client to the private bucket under RLS.
- GitHub sync is available via the Lovable GitHub integration (you connect it from the UI; I can't push directly, but the code stays standard React for any developer to review/extend).
- Data loading via TanStack Query; routes under `src/routes/`.

## Build order

1. Enable Cloud → migration (schema + enums + functions + RLS + seed) → storage bucket + policies.
2. Auth pages + route gate + profile trigger.
3. Design system + app shell/nav.
4. Calendar view + activity detail.
5. Activity form + attachments (photos, voice, video, docs, links).
6. Search/filter, dashboard stats, export report.

Once you approve (especially the schema + RLS above), I'll start with the backend migration so you can see the exact SQL before the UI is built.