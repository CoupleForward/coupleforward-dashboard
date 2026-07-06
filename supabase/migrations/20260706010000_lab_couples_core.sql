-- Lab foundation 1/4: couples, membership, invites.
-- Additive only. Never touches profiles / map_* / pending_purchases.
-- One couple per user (v1) enforced by UNIQUE (user_id) on couple_members.

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text,
  together_since date,
  created_by uuid references auth.users(id) on delete set null,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_huddle_week date,
  created_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'partner' check (role in ('owner', 'partner')),
  display_name text,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (user_id)
);

create table public.couple_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  invited_email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index couple_invites_pending_email_idx
  on public.couple_invites (lower(invited_email))
  where status = 'pending';

alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;

-- SECURITY DEFINER so policies on couple_members can consult membership
-- without recursing into their own RLS.
create or replace function public.lab_couple_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select couple_id from public.couple_members where user_id = auth.uid()
$$;

create or replace function public.lab_is_couple_member(cid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.couple_members
    where couple_id = cid and user_id = auth.uid()
  )
$$;

-- couples: readable/updatable by members only. Creation goes through
-- create_couple(); streak fields are written by complete_huddle().
create policy "lab members read couple"
  on public.couples for select
  using (public.lab_is_couple_member(id));

create policy "lab members update couple"
  on public.couples for update
  using (public.lab_is_couple_member(id));

-- couple_members: visible to fellow members; joining goes through RPCs
-- (a direct INSERT policy would let anyone attach themselves to any couple).
create policy "lab members read members"
  on public.couple_members for select
  using (public.lab_is_couple_member(couple_id));

create policy "lab member updates own row"
  on public.couple_members for update
  using (user_id = auth.uid());

-- couple_invites: members manage them; the invited person can see invites
-- addressed to their email.
create policy "lab invites read"
  on public.couple_invites for select
  using (
    public.lab_is_couple_member(couple_id)
    or lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "lab invites create"
  on public.couple_invites for insert
  with check (public.lab_is_couple_member(couple_id) and invited_by = auth.uid());

create policy "lab invites update"
  on public.couple_invites for update
  using (public.lab_is_couple_member(couple_id));

-- Creates the couple and enrolls the caller as owner, atomically.
create or replace function public.create_couple(
  p_name text default null,
  p_together_since date default null
)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_couple uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from couple_members where user_id = v_uid) then
    raise exception 'already in a couple';
  end if;
  insert into couples (name, together_since, created_by)
  values (p_name, p_together_since, v_uid)
  returning id into v_couple;
  insert into couple_members (couple_id, user_id, role, display_name)
  values (
    v_couple, v_uid, 'owner',
    (select coalesce(full_name, split_part(email, '@', 1)) from profiles where id = v_uid)
  );
  return v_couple;
end;
$$;

-- The invited partner joins their couple. Validates the invite is pending,
-- addressed to the caller's email, and the couple still has room.
create or replace function public.accept_couple_invite(p_invite_id uuid)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_invite couple_invites%rowtype;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  select email into v_email from auth.users where id = v_uid;
  select * into v_invite from couple_invites
    where id = p_invite_id and status = 'pending'
    for update;
  if not found then
    raise exception 'invite not found or no longer pending';
  end if;
  if lower(v_invite.invited_email) <> lower(v_email) then
    raise exception 'invite is addressed to a different email';
  end if;
  if exists (select 1 from couple_members where user_id = v_uid) then
    raise exception 'already in a couple';
  end if;
  if (select count(*) from couple_members where couple_id = v_invite.couple_id) >= 2 then
    raise exception 'couple already has two members';
  end if;
  insert into couple_members (couple_id, user_id, role, display_name)
  values (
    v_invite.couple_id, v_uid, 'partner',
    (select coalesce(full_name, split_part(email, '@', 1)) from profiles where id = v_uid)
  );
  update couple_invites
    set status = 'accepted', accepted_at = now()
    where id = p_invite_id;
  return v_invite.couple_id;
end;
$$;
