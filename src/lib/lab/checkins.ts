// Daily check-in reads. The table ships in migration 20260812150000; until
// that is applied, fetches fail and callers render nothing — the feature
// lights up without a code change once the migration lands.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dayKey } from "./week";
import type { DailyCheckin } from "./types";

export type CheckinData = {
  today: DailyCheckin[];
  recent: DailyCheckin[]; // last 14 days, oldest first
};

export async function getDailyCheckins(
  coupleId: string,
): Promise<CheckinData | null> {
  const supabase = await createSupabaseServerClient();
  const since = new Date();
  since.setDate(since.getDate() - 13);

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("couple_id", coupleId)
    .gte("day", dayKey(since))
    .order("day", { ascending: true });

  // Table not applied yet (or transient error): feature stays dark.
  if (error) return null;

  const rows = (data ?? []) as DailyCheckin[];
  const today = dayKey();
  return {
    today: rows.filter((r) => r.day === today),
    recent: rows,
  };
}
