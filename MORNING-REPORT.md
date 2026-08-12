# Morning Report — Rhythm membership build

Overnight autonomous build, night of August 11-12, 2026. Everything from the REWIRE Lab plan (docs/plan/) that was buildable on the existing schema without supervised steps is now built, adversarially reviewed in three rounds, and committed. No live database changes were made; no migrations were applied.

(The July 5-6 FOUNDATION report this file replaces is in git history: `git show 887920e:MORNING-REPORT.md`.)

## ⚠️ Supervised morning steps, in order

**1. Apply the RLS tightening migration FIRST → `supabase/migrations/20260811090000_lab_tighten_rls_updates.sql` (draft, NOT applied).** The overnight security review found a real hole in the July schema: the `couple_members` UPDATE policy has no WITH CHECK, so any member who learns another couple's UUID can re-point their own membership row at that couple and gain full read/write of their huddle answers and journal. Same shape on `journal_entries` UPDATE (cross-couple write injection), and `connection_scores` INSERT doesn't bind `user_id` to the caller. The draft migration fixes all three (WITH CHECK + column-level grants so `display_name` is the only member-updatable column). Verified: no client code writes those paths directly and all RPCs are SECURITY DEFINER, so nothing breaks. Apply via the Supabase MCP `apply_migration` in a session with you present.

**2. Confirm the two demo users** (still unconfirmed since July): Supabase dashboard → Authentication → Users → `jonathan.demo@coupleforward.test` and `elena.demo@coupleforward.test` → ⋯ → Confirm email.

**3. `npm run verify:flow`** then **`npm run dev`** and walk the new surfaces signed in (list below). Overnight testing covered everything except a signed-in browser session, which is blocked on step 2.

**4. Decide the week-key timezone fix before any deploy.** Pre-existing, now documented in `src/lib/lab/week.ts`: on a UTC host, the server's idea of "this week" diverges from the viewer's local Monday for part of every Sunday/Monday. Options: key all weeks in one fixed timezone, or derive the week client-side. Marked as a deploy blocker in the code.

**5. One small decision:** the account page tells members deletion requests are honored but names no channel. Pick the support address (or channel) and it gets wired in.

## What was built

All of it on the existing schema, all RLS-scoped, matching the two-anchor model in docs/plan/00 (rhythm membership + journey invitation, apps never gated).

→ **Huddle history**: `/history` lists every completed week (hugs, rituals, both closeness ratings); `/history/[week]` shows both partners' full reflect/ask answers and the week's plan. Reflect/ask answers finally have a place to be reread.
→ **The open app shelf**: sidebar and new `/apps` page link for real to the three live station apps (Mapping My Story, The Between, Adventures, new-tab). Parked tools show an honest "Soon" (no padlock: nothing is locked, it just isn't built). Mobile nav tabs are now real links: Home, Apps, Huddle, Journal, Account.
→ **Universal drill-downs** (the rule from docs/plan/01 §5a): every metric card opens into a depth view: what the number is, which weeks and answers produced it, full history, what tends to move it, honest framing. Connection Score (with per-partner reads and a divergence note), Satisfaction, Weekly Pulse, Streak (explicitly rhythm, never progress; real total from a count query), 4,000 Weeks (fake "~1,480 weeks left" stat replaced with honest arithmetic), and the 90 Day Loop (now explains the protocol and its five categories).
→ **The journey invitation**: a calm card on the dashboard plus `/journey`: the three phases (Map It / Rewire It / Lock It In), what is real today (the Inner Compass, linked to the live `/inner-compass` page), no invented timeline, no fake node map, and an explicit "the rhythm is a complete membership on its own."
→ **Honesty pass**: stale News and Substack cards deleted. Live Teaching is now a truthful placeholder (no fake schedule, recordings, or play buttons). Weekly prompt rotates deterministically per week and links into the journal.
→ **Breathwork is real**: `/breathe` has a working breath pacer (Box, 4-7-8, Physiological Sigh) with an animated circle. Pure client, nothing leaves the device.
→ **Journal history**: `/journal` shows every entry (the card kept its latest-three + composer, gained "See all").
→ **Account + data export**: `/account` (header gear and mobile Account tab) shows couple info, sign-out, and a Download-your-data button: complete, paginated export of every huddle, answer, journal entry, and score, reshaped to names and weeks with NO internal UUIDs (deliberate, see the security note above). Dead notification bell removed.

## How it was checked (the recursive loop)

Round 1: three independent adversarial reviewers (correctness, privacy/RLS, plan-conformance) over the full diff. They surfaced 20+ findings including the RLS hole, a 404 on the journey page's Inner Compass button, a silently capped "total Huddles" count, export truncation at Supabase's 1000-row limit, and a systemic em-dash voice violation. Every confirmed finding was fixed. Round 2: a fresh verifier audited each fix and found three small regressions (export paging on a mutable column, two mobile-nav highlights, one em dash). Fixed. Round 3: ground truth re-run and targeted sweeps came back dry.

Every round was also gated on: `npm run typecheck` (clean), eslint (only the 5 pre-existing errors in untouched files), `npm run build` (clean, 8 routes now), `npm run test:rls` (11/11 against live), and signed-out browser checks (all new routes 307 to /login; no console or server errors).

## Honest list of what this build did NOT do

→ No migrations applied; the journey engine, quizzes, movement measurement, and Compass-report surfaces remain unbuilt (they block on your node map, movement dictionary, and instrument decisions per docs/plan/02).
→ Payments still stubbed; email still not wired; no deploy (and the week-key blocker above must be decided first).
→ Signed-in browser walkthrough pending demo-user confirmation.
→ The Inner Compass link on /journey goes to the public page; in-Lab pricing/bundling per the plan is untouched.
