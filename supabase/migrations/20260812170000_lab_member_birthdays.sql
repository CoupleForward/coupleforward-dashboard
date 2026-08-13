-- Member birthdays for the 4,000 Weeks horizon (2026-08-12, Christian's
-- direction): each partner's weeks lived and weeks left, and the couple's
-- shared horizon = the smaller of the two remaining counts.
-- DRAFT — apply supervised via the Supabase MCP apply_migration.
--
-- Birthdays live on couple_members (visible within the couple via the
-- existing SELECT policy; that is the point). The 2026-08-12 column grant
-- restricted member updates to display_name, so the grant is re-issued
-- here to cover both columns. Members can only ever update their OWN row
-- (policy unchanged), so each partner sets their own birthday.

alter table public.couple_members
  add column if not exists birthday date;

revoke update on table public.couple_members from authenticated;
grant update (display_name, birthday)
  on table public.couple_members to authenticated;
