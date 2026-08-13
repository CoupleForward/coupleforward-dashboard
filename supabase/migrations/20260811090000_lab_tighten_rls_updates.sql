-- Tightens three RLS gaps surfaced by adversarial review on 2026-08-11.
-- APPLIED TO LIVE 2026-08-12 (supervised, Christian present) via the
-- Supabase MCP apply_migration. Verified: WITH CHECK present on all three
-- policies, couple_members UPDATE grant restricted to display_name only,
-- anon RLS suite 11/11.
--
-- 1. couple_members UPDATE had no WITH CHECK, so a member could re-point
--    their own membership row's couple_id at any couple whose UUID they
--    learned — granting full read/write of that couple's intimate content
--    (every other policy delegates to lab_is_couple_member). Fixed two
--    ways: WITH CHECK, plus column-level grants so display_name is the
--    only member-updatable column (also closes role self-promotion).
-- 2. journal_entries UPDATE had the same shape: an author could move their
--    own entry into a foreign couple's journal (write injection). WITH
--    CHECK now binds the row to a couple the author belongs to.
-- 3. connection_scores INSERT did not bind user_id to the caller, letting
--    one partner insert scores attributed to the other. Now bound.
--    complete_huddle is SECURITY DEFINER and unaffected.
--
-- No client code updates couple_members or inserts connection_scores
-- directly (verified by grep on 2026-08-11); the RPC paths are all
-- SECURITY DEFINER. This migration changes no data.

begin;

-- 1. couple_members: WITH CHECK + display_name-only updates.
drop policy if exists "lab member updates own row" on public.couple_members;
create policy "lab member updates own row"
  on public.couple_members for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke update on table public.couple_members from authenticated;
grant update (display_name) on table public.couple_members to authenticated;

-- 2. journal_entries: updates stay inside the author's own couple.
drop policy if exists "lab author updates journal" on public.journal_entries;
create policy "lab author updates journal"
  on public.journal_entries for update
  using (author_id = auth.uid())
  with check (
    author_id = auth.uid()
    and public.lab_is_couple_member(couple_id)
  );

-- 3. connection_scores: members insert only their own scores.
drop policy if exists "lab members write scores" on public.connection_scores;
create policy "lab members write scores"
  on public.connection_scores for insert
  with check (
    public.lab_is_couple_member(couple_id)
    and user_id = auth.uid()
  );

commit;
