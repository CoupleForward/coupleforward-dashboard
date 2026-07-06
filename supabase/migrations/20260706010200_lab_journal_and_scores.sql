-- Lab foundation 3/4: joint journal, connection score history, and the
-- complete_huddle() RPC that advances the couple's streak atomically.

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  title text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entries_couple_idx on public.journal_entries (couple_id, created_at desc);

create table public.connection_scores (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  huddle_id uuid references public.huddles(id) on delete set null,
  score integer not null check (score between 1 and 10),
  source text not null default 'huddle_reflect',
  created_at timestamptz not null default now()
);

create index connection_scores_couple_idx on public.connection_scores (couple_id, created_at desc);
-- Makes complete_huddle idempotent: re-completing cannot double-log scores.
create unique index connection_scores_huddle_user_idx
  on public.connection_scores (huddle_id, user_id)
  where huddle_id is not null;

alter table public.journal_entries enable row level security;
alter table public.connection_scores enable row level security;

create policy "lab members read journal"
  on public.journal_entries for select
  using (public.lab_is_couple_member(couple_id));

create policy "lab members write journal"
  on public.journal_entries for insert
  with check (public.lab_is_couple_member(couple_id) and author_id = auth.uid());

create policy "lab author updates journal"
  on public.journal_entries for update
  using (author_id = auth.uid());

create policy "lab author deletes journal"
  on public.journal_entries for delete
  using (author_id = auth.uid());

create policy "lab members read scores"
  on public.connection_scores for select
  using (public.lab_is_couple_member(couple_id));

create policy "lab members write scores"
  on public.connection_scores for insert
  with check (public.lab_is_couple_member(couple_id));

-- Completes a huddle and advances the couple's streak, atomically.
-- Week math: consecutive Mondays (7 days apart) extend the streak; a gap
-- resets it to 1; completing the same week twice is a no-op; back-filling
-- an older week never rewinds the streak.
-- Also copies the reflect-stage closeness ratings into connection_scores
-- (idempotent via the partial unique index).
create or replace function public.complete_huddle(p_huddle_id uuid)
returns table (current_streak integer, longest_streak integer)
language plpgsql security definer
set search_path = public
as $$
declare
  v_h huddles%rowtype;
  v_c couples%rowtype;
  v_new integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select * into v_h from huddles where id = p_huddle_id;
  if not found then
    raise exception 'huddle not found';
  end if;
  if not lab_is_couple_member(v_h.couple_id) then
    raise exception 'not a member of this couple';
  end if;

  select * into v_c from couples where id = v_h.couple_id for update;

  if v_h.status <> 'completed' then
    update huddles
      set status = 'completed', completed_at = now(), updated_at = now()
      where id = p_huddle_id;

    insert into connection_scores (couple_id, user_id, huddle_id, score, source)
    select a.couple_id, a.member_user_id, a.huddle_id, a.rating, 'huddle_reflect'
      from huddle_answers a
      where a.huddle_id = p_huddle_id
        and a.stage = 'reflect'
        and a.question_key = 'closeness'
        and a.rating is not null
    on conflict do nothing;

    if v_c.last_huddle_week is null then
      v_new := 1;
    elsif v_c.last_huddle_week = v_h.week_start then
      v_new := v_c.current_streak;
    elsif v_h.week_start - v_c.last_huddle_week = 7 then
      v_new := v_c.current_streak + 1;
    elsif v_h.week_start < v_c.last_huddle_week then
      v_new := v_c.current_streak;
    else
      v_new := 1;
    end if;

    update couples
      set current_streak = v_new,
          longest_streak = greatest(couples.longest_streak, v_new),
          last_huddle_week = greatest(coalesce(couples.last_huddle_week, v_h.week_start), v_h.week_start)
      where id = v_c.id;
  end if;

  return query
    select c.current_streak, c.longest_streak from couples c where c.id = v_h.couple_id;
end;
$$;
