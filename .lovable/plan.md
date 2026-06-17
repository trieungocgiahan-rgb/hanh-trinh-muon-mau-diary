# Fix auth: login, approval gate, and session drops

## What's wrong today (diagnosis)

1. **Can't log in after signing up.** Email confirmation is turned ON in the backend. Email/password signups (e.g. several accounts in the DB) have no `email_confirmed_at` and have never signed in. After signup the app shows a success toast and pushes the user to `/lich`, but no session exists until they click an email link — so the auth gate silently bounces them back to the login page. Google sign-ins work because they're auto-confirmed.

2. **No "Chờ duyệt" (pending) state exists.** The new-user trigger currently grants every signup full `member` access immediately. There is no approval gate or waiting screen anywhere — this needs to be built.

3. **Random drops to the loading screen.** Three compounding causes:
   - The protected-route gate runs a **network** `getUser()` on every auth event; a transient network blip throws → redirect to `/auth`.
   - The root auth listener fires `invalidateQueries()` on `SIGNED_IN`, which also fires on tab-refocus/token-refresh, causing refetch churn.
   - `AuthProvider.loading` can stay `true` forever if `getSession()` ever stalls (no timeout/fallback).

## Decisions (confirmed)
- New signups are **auto-confirmed** (instant login, no email link).
- New signups require **admin approval** before they can use the app.

---

## 1. Backend: auto-confirm + repair stuck accounts
- Enable auto-confirm for email signups (auth setting).
- One-time data fix: mark the existing unconfirmed accounts as confirmed so those people can finally log in.

## 2. Backend: approval gate (schema + RLS)
- Add a `pending` value to the `project_role` enum (alongside `admin`/`member`/`viewer`).
- Change the `handle_new_user` trigger: the very first user (when no admin exists) still becomes `admin`; **every other new signup becomes `pending`** instead of `member`.
- Harden the security-definer access functions so `pending` users can see **nothing** in the project: update `is_project_member`, `is_org_member`, `shares_project_with`, and `storage_path_project_member` to exclude the `pending` role. (Interaction/write functions already require `admin`/`member`, so pending is excluded there automatically.)
- Add a `memberships` SELECT policy `user_id = auth.uid()` so a pending user can read **their own** membership row (to detect the pending state) without seeing the team or any project data.

Net effect: a pending user is fully isolated — no activities, attachments, members, or media — and only knows that they are awaiting approval.

## 3. Frontend: detect pending + waiting screen
- `use-project.tsx`: expose a `pendingApproval` flag (raw membership row has role `pending` and no approved project). Keep the existing dedupe logic.
- `AppShell.tsx`: if `pendingApproval`, render a clean **"Chờ duyệt"** screen ("Tài khoản của bạn đang chờ quản trị viên duyệt…") with a sign-out button — instead of the nav + app content. Keep the existing "Bạn chưa thuộc dự án nào" message for the no-membership case.
- `activity-constants.ts`: add `pending: "Chờ duyệt"` to `ROLE_LABELS`.

## 4. Frontend: admin approval UI (Thành viên page)
- Add a **"Chờ duyệt"** section at the top listing pending members with **Duyệt** (approve → set role to `member`) and **Từ chối** (reject → delete membership) buttons. Admins already can read pending rows and update/delete memberships under existing policies.

## 5. Frontend: stop the random drops
- `_authenticated/route.tsx`: replace the network `getUser()` with a local `getSession()` check (instant, can't fail on a network blip); only redirect to `/auth` when there is genuinely no session. RLS still validates every request server-side.
- `__root.tsx` listener: only `invalidateQueries()` when the signed-in **user id actually changes** (track previous id), so token-refresh / tab-refocus `SIGNED_IN` events no longer trigger refetch storms.
- `use-auth.tsx`: add a timeout fallback (~8s) so `loading` can never hang forever, guard against setting state after unmount.

## 6. Frontend: signup flow copy
- `auth.tsx`: after signup, since the user is auto-confirmed and logged in but pending, show an accurate message ("Tài khoản đã tạo — đang chờ quản trị viên duyệt") and navigate to `/lich` (which will resolve to the waiting screen).

## 7. Cleanup
- Investigate and resolve the React #418 hydration warning surfaced in the preview while touching these files.

---

## Technical notes
- Enum change + trigger + RLS + policy go in one migration. Auto-confirm is an auth-config change; confirming existing accounts is a one-time data update.
- Existing 11 members keep their current roles (admin/member) — only future signups land in `pending`.
- The waiting screen intentionally needs no project data, so RLS can fully isolate pending users without breaking detection.

## Walkthrough (delivered after the fix)
I'll explain each root cause and the exact change that addresses it: (1) email confirmation blocking login, (2) the new pending/approval flow and waiting screen, (3) the gate/listener/timeout fixes that stop the random drops.