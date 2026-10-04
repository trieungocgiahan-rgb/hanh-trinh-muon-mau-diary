# Nhật ký dự án

Build a full-stack web app called "Nhật Ký Hành Trình" for logging the journey of community/social-impact projects. The entire UI must be in Vietnamese.

## PURPOSE

A shared activity journal where a team logs each event (workshops, meetings, site visits, etc.), attaches photos/voice notes/videos/documents, and views everything on a calendar. The data is shared across the whole team (cloud database, not local). Built to scale to multiple organizations and projects later.

## DATA STRUCTURE (design for multi-tenancy from the start)

Hierarchy: Organization → Project → Activity (event).

- An Organization has many Projects and many Members.

- A Project belongs to one Organization and has many Activities.

- For now seed one Organization ("Nét Mơ") and one Project ("Season 2 — Chuyện của Mây"), but the schema must support adding more later without restructuring.

## ROLES & PERMISSIONS (use Supabase Auth + Row-Level Security)

Three roles per project:

1. Admin — create/edit/delete any activity, manage members, invite people, change roles.

2. Member — create activities and edit/delete only their OWN activities.

3. Viewer — read-only (for advisors/sponsors). Cannot create or edit anything.

IMPORTANT: Set up RLS policies so users only see data from organizations/projects they belong to. Make all uploaded media (photos, voice, video, documents) stored in PRIVATE storage buckets with signed-URL access — never public — because content includes photos of children and elderly people and must stay confidential.

## ACTIVITY FIELDS

Each activity has:

- Tên hoạt động (title) — required

- Ngày (date) — required

- Loại hoạt động (type): Workshop / Họp team / Họp đối tác / Thăm cơ sở / Sự kiện / Khác

- Trạng thái (status): Hoàn thành / Đang diễn ra / Kế hoạch / Có vấn đề

- Địa điểm (location)

- Số người tham gia (participant count, number)

- Diễn biến chính (main summary, long text)

- Quote / Điểm nổi bật (highlight quote, long text) — displayed prominently

- Vấn đề phát sinh (issues, long text)

- Bước tiếp theo (next steps, long text)

- Người ghi (author — auto-filled from logged-in user)

- Attachments: photos, voice notes, short videos, document files (PDF/Word), and external links

## KEY FEATURES

1. **Calendar view as the main screen** — show activities on a monthly calendar, color-coded by activity type. Clicking a day or an activity opens its detail. Include a way to switch to a list/timeline view as secondary.

2. **Quick logging** — a prominent "+ Ghi hoạt động" button opens a form to add an activity fast.

3. **Photo upload** — drag-drop or file picker, multiple photos per activity, thumbnail gallery with lightbox to view full size.

4. **Voice notes** — record audio directly in the browser (use the MediaRecorder API), save to the activity, play back inline. Also allow uploading existing audio files.

5. **Video & documents** — upload short videos and PDF/Word files as attachments.

6. **External links** — paste links (e.g. Google Drive) attached to an activity.

7. **Export report** — generate a Markdown/Word-style report of all activities in a project (overview stats + each activity detailed), downloadable to send to advisors/sponsors via email.

8. **Search & filter** — search by title/location/quote; filter by activity type and status.

9. **Dashboard stats** — total activities, number of workshops, total participants, completed count.

## DESIGN DIRECTION

Bright, youthful, energetic — this is a student-led project, the vibe should feel alive and fun, NOT corporate. 

- Palette: vibrant but tasteful — think warm coral/peach, sunny yellow accents, a friendly purple, soft mint, on clean off-white. Use color generously but keep it readable.

- Rounded corners, soft shadows, playful but clean.

- Typography: a friendly, characterful display font for titles paired with a highly legible sans-serif for body. Avoid stiff/formal fonts.

- Micro-interactions: subtle hover effects, smooth transitions when opening activity details, a little delight when saving (e.g. a cheerful toast).

- Calendar should feel colorful and inviting, not like a dull spreadsheet.

- Fully responsive — works great on both phone and desktop, since the team logs on both. Mobile-first for the quick-logging flow.

- All text, labels, buttons, empty states in Vietnamese.

## TECH

- React + Tailwind + shadcn/ui components.

- Supabase for database, auth, and storage.

- Sync to GitHub so a developer can review and extend the code.

Start by setting up the data schema and authentication, then build the calendar view and the activity creation form. Show me the schema and RLS policies before finalizing so I can review them.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hanh-trinh-muon-mau-diary.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/15bd3bcd-e36b-4ab3-a0bc-7bc510ceee33).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
