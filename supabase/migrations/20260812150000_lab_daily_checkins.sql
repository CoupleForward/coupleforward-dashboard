-- Daily check-in instrument (2026-08-12, per Christian's design; spec in
-- docs/plan/05-daily-weekly-instruments.md).
-- DRAFT — apply supervised via the Supabase MCP apply_migration.
--
-- One row per member per local day: mood, happiness, connection, each 1-10.
-- Per-partner lines + a blended couple connection score render on the
-- dashboard; the gap between partners is displayed, never hidden by the
-- average. Day keys are the viewer's local YYYY-MM-DD, consistent with the
-- huddle week keys (and sharing their known timezone deploy-blocker note in
-- src/lib/lab/week.ts).
--
-- Policies follow the post-2026-08-12 discipline: WITH CHECK on every
-- write path, user_id always bound to the caller.

create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  mood integer not null check (mood between 1 and 10),
  happiness integer not null check (happiness between 1 and 10),
  connection integer not null check (connection between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One check-in per member per day; re-submitting the same day updates it.
create unique index daily_checkins_user_day_idx
  on public.daily_checkins (user_id, day);
create index daily_checkins_couple_idx
  on public.daily_checkins (couple_id, day desc);

alter table public.daily_checkins enable row level security;

create policy "lab members read checkins"
  on public.daily_checkins for select
  using (public.lab_is_couple_member(couple_id));

create policy "lab member writes own checkin"
  on public.daily_checkins for insert
  with check (
    public.lab_is_couple_member(couple_id)
    and user_id = auth.uid()
  );

create policy "lab member updates own checkin"
  on public.daily_checkins for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and public.lab_is_couple_member(couple_id)
  );

-- Live partner sync, same pattern as the huddle tables.
alter publication supabase_realtime add table public.daily_checkins;
alter table public.daily_checkins replica identity full;
