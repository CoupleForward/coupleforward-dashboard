"use client";

// The daily ping: three taps, under fifteen seconds. Mood, happiness,
// connection, each 1-10. Your raw answers are yours alone (RLS-enforced);
// your partner sees only that you checked in, the blended couple score,
// and the streaks (spec: docs/plan/05, privacy model of 2026-08-12).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardLabel } from "../Card";
import { CheckIcon, FlameIcon } from "../icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { dayKey } from "@/lib/lab/week";
import type { DailySummaryRow, DailyStreaks } from "@/lib/lab/checkins";

const QUESTIONS = [
  { key: "mood", label: "In myself", hint: "How I feel in me today" },
  { key: "happiness", label: "My day", hint: "How I feel about my day" },
  { key: "connection", label: "Us", hint: "How connected I feel to you" },
] as const;

type QKey = (typeof QUESTIONS)[number]["key"];

function ScaleRow({
  label,
  hint,
  value,
  onPick,
}: {
  label: string;
  hint: string;
  value: number | null;
  onPick: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-cream">{label}</span>
        <span className="text-[10px] text-cream-mute">{hint}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPick(n)}
            aria-label={`${label}: ${n} of 10`}
            className={`h-8 rounded-md text-[11px] tabular-nums transition ${
              value === n
                ? "bg-gold text-[#1a1a1a] font-semibold"
                : "bg-card-2/70 border border-line-soft/60 text-cream-dim hover:border-gold/40"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DailyCheckinCard({
  coupleId,
  userId,
  today,
  partnerName,
  hasPartner,
  streaks,
}: {
  coupleId: string;
  userId: string;
  today: DailySummaryRow | null;
  partnerName: string | null;
  hasPartner: boolean;
  streaks: DailyStreaks;
}) {
  const router = useRouter();
  const mineDone = today?.me_checked ?? false;

  const [editing, setEditing] = useState(!mineDone);
  const [vals, setVals] = useState<Record<QKey, number | null>>({
    mood: today?.my_mood ?? null,
    happiness: today?.my_happiness ?? null,
    connection: today?.my_connection ?? null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = vals.mood && vals.happiness && vals.connection;

  const save = async () => {
    if (!complete) return;
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("daily_checkins").upsert(
      {
        couple_id: coupleId,
        user_id: userId,
        day: dayKey(),
        mood: vals.mood,
        happiness: vals.happiness,
        connection: vals.connection,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,day" },
    );
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  };

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <CardLabel>Today&apos;s check-in</CardLabel>
        {mineDone && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[11px] text-cream-dim hover:text-cream transition"
          >
            Change mine
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-3.5">
          <p className="text-[11px] text-cream-mute leading-snug">
            Three quick reads, 1 to 10. Your answers stay yours: your partner
            sees the blended picture, never your numbers.
          </p>
          {QUESTIONS.map((q) => (
            <ScaleRow
              key={q.key}
              label={q.label}
              hint={q.hint}
              value={vals[q.key]}
              onPick={(n) => setVals((v) => ({ ...v, [q.key]: n }))}
            />
          ))}
          {error && <p className="text-[11.5px] text-[#e08a8a]">{error}</p>}
          <button
            type="button"
            onClick={save}
            disabled={!complete || busy}
            className="w-full rounded-full bg-gold text-[#1a1a1a] px-4 py-2 text-[12px] font-semibold hover:bg-gold-bright transition disabled:opacity-40"
          >
            {busy ? "Saving…" : "Done"}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center gap-2 text-[12.5px] text-cream-dim">
            <span className="size-5 rounded-full bg-gold-soft grid place-items-center text-gold">
              <CheckIcon className="size-3" />
            </span>
            You checked in today.
          </div>
          {hasPartner && (
            <div className="flex items-center gap-2 text-[12.5px] text-cream-dim">
              {today?.partner_checked ? (
                <>
                  <span className="size-5 rounded-full bg-gold-soft grid place-items-center text-gold">
                    <CheckIcon className="size-3" />
                  </span>
                  {partnerName ?? "Your partner"} checked in today.
                </>
              ) : (
                <>
                  <span className="size-5 rounded-full bg-card-2 border border-line-soft/60" />
                  {partnerName ?? "Your partner"} hasn&apos;t checked in yet.
                </>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-cream-mute">
            <span className="inline-flex items-center gap-1">
              <FlameIcon className="size-3 text-gold" />
              You: {streaks.mine} {streaks.mine === 1 ? "day" : "days"}
            </span>
            {hasPartner && (
              <>
                <span>
                  {partnerName ?? "Partner"}: {streaks.partner}{" "}
                  {streaks.partner === 1 ? "day" : "days"}
                </span>
                <span>
                  Together: {streaks.together}{" "}
                  {streaks.together === 1 ? "day" : "days"}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
