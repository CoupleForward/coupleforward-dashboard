"use client";

// The daily ping: three taps, under fifteen seconds. Mood, happiness,
// connection, each 1-10. One check-in per member per day; answering again
// updates it. Both partners see both (spec default, docs/plan/05).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardLabel } from "../Card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { dayKey } from "@/lib/lab/week";
import type { DailyCheckin } from "@/lib/lab/types";

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
  todayRows,
  memberNames,
}: {
  coupleId: string;
  userId: string;
  todayRows: DailyCheckin[];
  memberNames: Record<string, string>;
}) {
  const router = useRouter();
  const mine = todayRows.find((r) => r.user_id === userId) ?? null;
  const theirs = todayRows.find((r) => r.user_id !== userId) ?? null;

  const [editing, setEditing] = useState(mine === null);
  const [vals, setVals] = useState<Record<QKey, number | null>>({
    mood: mine?.mood ?? null,
    happiness: mine?.happiness ?? null,
    connection: mine?.connection ?? null,
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

  const nameOf = (uid: string) => memberNames[uid] ?? "Partner";

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <CardLabel>Today&apos;s check-in</CardLabel>
        {mine && !editing && (
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
          {[mine, theirs].filter(Boolean).map((row) => (
            <div key={row!.id}>
              <div className="text-[10px] tracking-[0.14em] uppercase text-gold">
                {row!.user_id === userId ? "You" : nameOf(row!.user_id)}
              </div>
              <div className="mt-1 flex gap-2 text-[11.5px] text-cream-dim">
                {QUESTIONS.map((q) => (
                  <span
                    key={q.key}
                    className="flex-1 rounded-lg bg-card-2/60 border border-line-soft/60 px-2 py-1.5 text-center"
                  >
                    {q.label}{" "}
                    <span className="text-cream tabular-nums">
                      {row![q.key]}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))}
          {!theirs && (
            <p className="text-[11px] text-cream-mute">
              Your partner hasn&apos;t checked in yet today.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
