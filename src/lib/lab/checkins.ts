// Daily check-in reads, privacy-preserving (spec: docs/plan/05, revised
// 2026-08-12). Raw answers are author-only under RLS; everything shared
// comes through the lab_daily_summary RPC, which returns the blended
// couple connection, the gap, check-in flags, and ONLY the caller's own
// numbers. Until migration 20260812150000 is applied, the RPC does not
// exist, calls fail, and callers render nothing.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dayKey } from "./week";

export type DailySummaryRow = {
  day: string; // YYYY-MM-DD
  avg_connection: number | null;
  connection_gap: number | null;
  me_checked: boolean;
  partner_checked: boolean;
  my_mood: number | null;
  my_happiness: number | null;
  my_connection: number | null;
};

export type DailyStreaks = {
  mine: number;
  partner: number;
  together: number; // consecutive days BOTH checked in
};

export type DailyData = {
  rows: DailySummaryRow[]; // oldest first
  today: DailySummaryRow | null;
  streaks: DailyStreaks;
};

// Consecutive days ending today (or yesterday, so a streak isn't "broken"
// before today's chance to check in has passed).
function streakFrom(
  rows: DailySummaryRow[],
  checked: (r: DailySummaryRow) => boolean,
): number {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const today = new Date();
  let count = 0;
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const row = byDay.get(dayKey(d));
    const hit = row ? checked(row) : false;
    if (hit) {
      count++;
      continue;
    }
    // Today not (yet) checked does not break the streak; any other gap does.
    if (i === 0) continue;
    break;
  }
  return count;
}

export async function getDailyData(): Promise<DailyData | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("lab_daily_summary", {
    p_days: 16,
  });
  if (error) return null;

  const rows = ((data ?? []) as DailySummaryRow[]).sort((a, b) =>
    a.day.localeCompare(b.day),
  );
  const today = rows.find((r) => r.day === dayKey()) ?? null;
  return {
    rows,
    today,
    streaks: {
      mine: streakFrom(rows, (r) => r.me_checked),
      partner: streakFrom(rows, (r) => r.partner_checked),
      together: streakFrom(rows, (r) => r.me_checked && r.partner_checked),
    },
  };
}
