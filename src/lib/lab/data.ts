import { createSupabaseServerClient } from "@/lib/supabase/server";
import { weekStart } from "./week";
import type {
  ConnectionScore,
  Couple,
  CoupleInvite,
  CoupleMember,
  Huddle,
  JournalEntry,
} from "./types";

export type LabContext = {
  userId: string;
  email: string;
  couple: Couple;
  members: CoupleMember[]; // owner (or earliest joiner) first
  pendingInvite: CoupleInvite | null;
};

export type DashboardData = LabContext & {
  currentHuddle: Huddle | null;
  previousHuddle: Huddle | null;
  recentCompletedWeeks: string[]; // week_start of recent completed huddles
  sharedWeeks: number | null; // weeks since together_since
  latestScores: ConnectionScore[]; // most recent score per member
  scoreHistory: { week_start: string; avg: number }[]; // per completed huddle
  journalEntries: JournalEntry[];
};

// Membership + couple for the signed-in user, or the reason there isn't one.
export async function getLabContext(): Promise<
  | { state: "signed_out" }
  | { state: "no_couple"; userId: string; email: string }
  | ({ state: "ok" } & LabContext)
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "signed_out" };

  const { data: membership } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) {
    return { state: "no_couple", userId: user.id, email: user.email ?? "" };
  }

  const [{ data: couple }, { data: members }, { data: invites }] =
    await Promise.all([
      supabase
        .from("couples")
        .select("*")
        .eq("id", membership.couple_id)
        .single(),
      supabase
        .from("couple_members")
        .select("*")
        .eq("couple_id", membership.couple_id)
        .order("joined_at", { ascending: true }),
      supabase
        .from("couple_invites")
        .select("*")
        .eq("couple_id", membership.couple_id)
        .eq("status", "pending"),
    ]);
  if (!couple) return { state: "no_couple", userId: user.id, email: user.email ?? "" };

  const ordered = [...(members ?? [])].sort((a, b) =>
    a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0,
  );

  return {
    state: "ok",
    userId: user.id,
    email: user.email ?? "",
    couple: couple as Couple,
    members: ordered as CoupleMember[],
    pendingInvite: (invites?.[0] as CoupleInvite | undefined) ?? null,
  };
}

export async function getDashboardData(
  ctx: LabContext,
): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();
  const thisWeek = weekStart();

  const [huddlesRes, scoresRes, journalRes] = await Promise.all([
    supabase
      .from("huddles")
      .select("*")
      .eq("couple_id", ctx.couple.id)
      .order("week_start", { ascending: false })
      .limit(20),
    supabase
      .from("connection_scores")
      .select("*")
      .eq("couple_id", ctx.couple.id)
      .order("created_at", { ascending: false })
      .limit(60),
    supabase
      .from("journal_entries")
      .select("*")
      .eq("couple_id", ctx.couple.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const huddles = (huddlesRes.data ?? []) as Huddle[];
  const scores = (scoresRes.data ?? []) as ConnectionScore[];

  const currentHuddle = huddles.find((h) => h.week_start === thisWeek) ?? null;
  const previousHuddle =
    huddles.find((h) => h.week_start < thisWeek) ?? null;
  const recentCompletedWeeks = huddles
    .filter((h) => h.status === "completed")
    .map((h) => h.week_start);

  // Latest score per member (for the gauge)
  const latestScores: ConnectionScore[] = [];
  for (const m of ctx.members) {
    const s = scores.find((x) => x.user_id === m.user_id);
    if (s) latestScores.push(s);
  }

  // Per-huddle averages, oldest first (for the satisfaction sparkline)
  const byHuddle = new Map<string, { week_start: string; vals: number[] }>();
  for (const h of huddles.filter((x) => x.status === "completed")) {
    byHuddle.set(h.id, { week_start: h.week_start, vals: [] });
  }
  for (const s of scores) {
    if (s.huddle_id && byHuddle.has(s.huddle_id)) {
      byHuddle.get(s.huddle_id)!.vals.push(s.score);
    }
  }
  const scoreHistory = [...byHuddle.values()]
    .filter((x) => x.vals.length > 0)
    .map((x) => ({
      week_start: x.week_start,
      avg: x.vals.reduce((a, b) => a + b, 0) / x.vals.length,
    }))
    .sort((a, b) => a.week_start.localeCompare(b.week_start))
    .slice(-10);

  const sharedWeeks = ctx.couple.together_since
    ? Math.max(
        0,
        Math.floor(
          (Date.now() -
            new Date(`${ctx.couple.together_since}T12:00:00`).getTime()) /
            (7 * 24 * 60 * 60 * 1000),
        ),
      )
    : null;

  return {
    ...ctx,
    currentHuddle,
    previousHuddle,
    recentCompletedWeeks,
    sharedWeeks,
    latestScores,
    scoreHistory,
    journalEntries: (journalRes.data ?? []) as JournalEntry[],
  };
}

// "Jonathan & Elena" from member display names.
export function coupleDisplayName(ctx: LabContext): string {
  const names = ctx.members.map(
    (m) => (m.display_name ?? "").split(" ")[0] || "Partner",
  );
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return names[0] ?? "Your couple";
}
