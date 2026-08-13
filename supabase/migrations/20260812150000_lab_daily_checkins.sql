-- Daily check-in instrument (2026-08-12, per Christian's design; spec in
-- docs/plan/05-daily-weekly-instruments.md, privacy model revised same day).
-- DRAFT — apply supervised via the Supabase MCP apply_migration.
--
-- Privacy model (his call): each partner's raw daily answers are PRIVATE
-- to their author, enforced by RLS, not by the UI. Both partners see the
-- dashboard outputs: the blended couple connection score, the gap, whether
-- each partner checked in, and the daily streaks. Those come from a
-- SECURITY DEFINER summary function that aggregates without ever returning
-- the partner's individual numbers.
--
-- (Honest math note, recorded: with two people, your own connection score
-- plus the blended average discloses your partner's connection score by
-- arithmetic. Mood and happiness are never blended, so they stay truly
-- private. This is inherent to any two-person average and was accepted in
-- the spec review.)

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

-- Raw rows: author-only, in every direction.
create policy "lab member reads own checkins"
  on public.daily_checkins for select
  using (user_id = auth.uid());

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

-- The shared view of the daily data: blended connection, gap, who checked
-- in, plus the caller's own answers. Never the partner's raw numbers.
-- SECURITY DEFINER to read across the couple; scoped hard to the caller's
-- own couple via lab_couple_id(). Extra days of range are returned so the
-- client can key days in its own timezone.
create or replace function public.lab_daily_summary(p_days integer default 16)
returns table (
  day date,
  avg_connection numeric,
  connection_gap numeric,
  me_checked boolean,
  partner_checked boolean,
  my_mood integer,
  my_happiness integer,
  my_connection integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.day,
    round(avg(d.connection)::numeric, 2) as avg_connection,
    case
      when count(*) > 1 then (max(d.connection) - min(d.connection))::numeric
      else null
    end as connection_gap,
    bool_or(d.user_id = auth.uid()) as me_checked,
    bool_or(d.user_id <> auth.uid()) as partner_checked,
    max(d.mood) filter (where d.user_id = auth.uid()) as my_mood,
    max(d.happiness) filter (where d.user_id = auth.uid()) as my_happiness,
    max(d.connection) filter (where d.user_id = auth.uid()) as my_connection
  from public.daily_checkins d
  where d.couple_id = public.lab_couple_id()
    and d.day >= current_date - (p_days + 1)
  group by d.day
  order by d.day;
$$;

revoke execute on function public.lab_daily_summary(integer) from anon, public;
grant execute on function public.lab_daily_summary(integer) to authenticated;

-- Realtime on the caller's own rows (RLS governs subscriptions too).
alter publication supabase_realtime add table public.daily_checkins;
alter table public.daily_checkins replica identity full;
