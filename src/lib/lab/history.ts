// Read helpers for past huddles. All queries run under the couple-member
// RLS policies — a member only ever sees their own couple's rows.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ConnectionScore, Huddle, HuddleAnswer } from "./types";

export type HuddleWeek = {
  huddle: Huddle;
  scores: ConnectionScore[]; // closeness scores logged for this huddle
};

export async function getCompletedHuddles(
  coupleId: string,
  limit = 260, // five years of weeks; the list page states the window
): Promise<HuddleWeek[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: huddles }, { data: scores }] = await Promise.all([
    supabase
      .from("huddles")
      .select("*")
      .eq("couple_id", coupleId)
      .eq("status", "completed")
      .order("week_start", { ascending: false })
      .limit(limit),
    supabase
      .from("connection_scores")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false })
      .limit(limit * 2 + 8),
  ]);

  const list = (huddles ?? []) as Huddle[];
  const allScores = (scores ?? []) as ConnectionScore[];
  return list.map((huddle) => ({
    huddle,
    scores: allScores.filter((s) => s.huddle_id === huddle.id),
  }));
}

export type HuddleDetail = {
  huddle: Huddle;
  answers: HuddleAnswer[];
  scores: ConnectionScore[];
};

// week is the Monday key (YYYY-MM-DD) — same shape weekStart() produces.
export async function getHuddleByWeek(
  coupleId: string,
  week: string,
): Promise<HuddleDetail | null> {
  // Defensive: only accept a plain date key before it touches a filter.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) return null;

  const supabase = await createSupabaseServerClient();
  const { data: huddle } = await supabase
    .from("huddles")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("week_start", week)
    .maybeSingle();
  if (!huddle) return null;

  const [{ data: answers }, { data: scores }] = await Promise.all([
    supabase
      .from("huddle_answers")
      .select("*")
      .eq("huddle_id", (huddle as Huddle).id),
    supabase
      .from("connection_scores")
      .select("*")
      .eq("huddle_id", (huddle as Huddle).id),
  ]);

  return {
    huddle: huddle as Huddle,
    answers: (answers ?? []) as HuddleAnswer[],
    scores: (scores ?? []) as ConnectionScore[],
  };
}

export function formatWeekLabel(week: string): string {
  const d = new Date(`${week}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
