-- Lab foundation 2/4: weekly huddles and their answers.
-- One huddle per couple per week (week_start = the Monday of that week).
-- Reflect/Ask answers are intimate content: RLS restricts every row to the
-- two members of the couple, and nothing is readable pre-auth.

create table public.huddles (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  week_start date not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  hug_count integer not null default 0 check (hug_count >= 0),
  plan jsonb not null default '{}'::jsonb,
  commit_prefs jsonb not null default '{}'::jsonb,
  started_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (couple_id, week_start)
);

create index huddles_couple_week_idx on public.huddles (couple_id, week_start desc);

-- One row per (huddle, member, question). member_user_id is who the answer
-- BELONGS to; either partner may type it (couples huddle on one device),
-- which is why policies are couple-scoped rather than row-owner-scoped.
create table public.huddle_answers (
  id uuid primary key default gen_random_uuid(),
  huddle_id uuid not null references public.huddles(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  member_user_id uuid not null references auth.users(id) on delete cascade,
  stage text not null check (stage in ('reflect', 'ask')),
  question_key text not null,
  answer_text text,
  rating integer check (rating between 1 and 10),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (huddle_id, member_user_id, stage, question_key)
);

create index huddle_answers_huddle_idx on public.huddle_answers (huddle_id);

alter table public.huddles enable row level security;
alter table public.huddle_answers enable row level security;

create policy "lab members read huddles"
  on public.huddles for select
  using (public.lab_is_couple_member(couple_id));

create policy "lab members create huddles"
  on public.huddles for insert
  with check (public.lab_is_couple_member(couple_id));

create policy "lab members update huddles"
  on public.huddles for update
  using (public.lab_is_couple_member(couple_id));

create policy "lab members read answers"
  on public.huddle_answers for select
  using (public.lab_is_couple_member(couple_id));

create policy "lab members write answers"
  on public.huddle_answers for insert
  with check (
    public.lab_is_couple_member(couple_id)
    and exists (
      select 1 from public.huddles h
      where h.id = huddle_id and h.couple_id = huddle_answers.couple_id
    )
    and exists (
      select 1 from public.couple_members m
      where m.couple_id = huddle_answers.couple_id
        and m.user_id = huddle_answers.member_user_id
    )
  );

create policy "lab members update answers"
  on public.huddle_answers for update
  using (public.lab_is_couple_member(couple_id));
