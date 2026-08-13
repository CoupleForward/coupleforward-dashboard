-- Solo journeys + partner-name capture (2026-08-12).
-- DRAFT — apply supervised via the Supabase MCP apply_migration.
--
-- Additive only, two nullable/defaulted columns. No policy changes: the
-- existing "lab members update couple" policy already lets a member set
-- is_solo on their own couple, and the "lab invites create" policy already
-- covers inserting invited_name. Member display names are written to
-- couple_members.display_name via the column grant added 2026-08-12.
--
-- Model: a solo member is a couple of one with is_solo = true. Inviting a
-- partner later flips is_solo to false and adds the second member; nothing
-- else changes.

alter table public.couples
  add column if not exists is_solo boolean not null default false;

-- The invited partner's name, captured by the inviter so the dashboard can
-- show "You & <name>" while the invite is still pending.
alter table public.couple_invites
  add column if not exists invited_name text;
