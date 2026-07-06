# coupleforward-dashboard (the Lab)

Members dashboard for Couple Forward. Next.js 16 (App Router, `src/`, Turbopack), React 19, Tailwind 4 (CSS-first config in `globals.css`), TypeScript strict.

## Backend
→ Supabase project `btlbgdrhujfoayxzbdjp` — the SHARED ecosystem backend. It also hosts the Maps app (`profiles`, `map_*`, `pending_purchases`). `profiles` is the shared account layer, one row per auth user, auto-created by the `handle_new_user` trigger.
→ Lab-owned tables: `couples`, `couple_members`, `couple_invites`, `huddles`, `huddle_answers`, `journal_entries`, `connection_scores`. SQL lives in `supabase/migrations/`, applied via the Supabase MCP `apply_migration` (tracked). NEVER alter or drop the Maps tables from this repo.
→ Hard rule: every new table gets RLS in the same migration that creates it, scoped by couple membership (`lab_is_couple_member`). Huddle answers and journal entries are intimate content.
→ Joining a couple goes ONLY through the `create_couple` / `accept_couple_invite` RPCs (a direct insert policy on `couple_members` would let anyone join any couple).

## Run
→ `npm run dev` (localhost:3000), `npm run typecheck` (the build swallows TS errors — run this explicitly), `npm run test:rls` (anon RLS checks, live DB, read-only probes), `npm run verify:flow` (full couple flow via API; needs the confirmed demo users).
→ `.env.local` holds the Supabase URL + anon key (publishable; server-only keys do not belong in this repo). Demo account creds also live there.

## Auth & sync model
→ Supabase Auth, email+password and magic link. `src/proxy.ts` (Next 16 middleware) refreshes the session cookie and gates routes.
→ Two accounts link to one `couples` row (v1: one couple per user, enforced by UNIQUE on `couple_members.user_id`).
→ The Huddle (`src/app/huddle/page.tsx` + `src/lib/lab/useHuddle.ts`) mirrors DB state locally, debounces writes per field, subscribes to realtime changes, and refetches on window focus. `complete_huddle` RPC advances the streak and copies closeness ratings into `connection_scores`.

## Payments
→ NOT wired. `src/lib/lab/membership.ts` is a stub that always allows; the real flag is `profiles.dashboard_access`, set by the coupleforward-web checkout provisioning. Wire Stripe there, not here.
