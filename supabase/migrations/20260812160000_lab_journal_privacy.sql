-- Private vs couple journaling (2026-08-12, Christian's direction).
-- DRAFT — apply supervised via the Supabase MCP apply_migration.
--
-- Every entry is either shared with the couple ('couple', the default and
-- the existing behavior) or visible only to its author ('private').
-- Enforced by RLS, not by the UI. Existing rows stay 'couple', which
-- matches what their authors believed when they wrote them.

alter table public.journal_entries
  add column if not exists visibility text not null default 'couple'
  check (visibility in ('couple', 'private'));

drop policy if exists "lab members read journal" on public.journal_entries;
create policy "lab members read journal"
  on public.journal_entries for select
  using (
    public.lab_is_couple_member(couple_id)
    and (visibility = 'couple' or author_id = auth.uid())
  );

-- Insert/update/delete policies are already author-bound (update tightened
-- 2026-08-12 with WITH CHECK); visibility rides on the same rows.
