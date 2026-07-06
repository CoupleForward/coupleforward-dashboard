-- Lab foundation 4/4: realtime change feeds for live partner sync.
-- Only the new Lab tables are added to the publication; existing tables
-- are untouched. RLS still governs what each subscriber can see.

alter publication supabase_realtime add table public.huddles;
alter publication supabase_realtime add table public.huddle_answers;
alter publication supabase_realtime add table public.couples;

-- Realtime needs the full old row to evaluate RLS on UPDATEs.
alter table public.huddles replica identity full;
alter table public.huddle_answers replica identity full;
alter table public.couples replica identity full;
