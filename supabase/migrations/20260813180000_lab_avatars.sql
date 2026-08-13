-- Profile photos (task 16): private avatars bucket + storage RLS.
--
-- NOT YET APPLIED. Policy: migrations reach the live project only in
-- supervised sessions (Christian present) via the Supabase MCP
-- apply_migration. Written 2026-08-13 for the next supervised apply;
-- the upload UI on /account lands after this is live.
--
-- Layout: one folder per user, avatars/<user_id>/avatar.<ext>.
-- Owners manage their own file; reads are limited to the owner and
-- their couple partner (avatars render in the header couple graphic).

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

create policy "lab avatar insert own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "lab avatar update own folder"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "lab avatar delete own folder"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "lab avatar read own couple"
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and exists (
    select 1
    from public.couple_members me
    join public.couple_members them on them.couple_id = me.couple_id
    where me.user_id = auth.uid()
      and them.user_id::text = (storage.foldername(name))[1]
  )
);
