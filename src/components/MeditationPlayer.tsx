"use client";

// The guided meditation player, generalized from the breath pacer. Two
// modes per meditation: recorded audio (when Christian's recording
// exists) or guided text, where cues advance on their own timing with a
// progress ring. Pure client — nothing leaves the device.

import { useEffect, useState } from "react";
import {
  MEDITATIONS,
  meditationDuration,
  type Meditation,
} from "@/lib/lab/meditations";

function fmtMin(sec: number): string {
  return `${Math.round(sec / 60)} min`;
}

type Session = {
  meditation: Meditation;
  cueIdx: number; // -1 = one-beat "Ready" lead-in
  remaining: number;
  paused: boolean;
  done: boolean;
};

export function MeditationPlayer() {
  const [session, setSession] = useState<Session | null>(null);
  const running = session !== null && !session.paused && !session.done;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSession((s) => {
        if (!s || s.paused || s.done) return s;
        if (s.remaining > 1) return { ...s, remaining: s.remaining - 1 };
        const nextIdx = s.cueIdx + 1;
        if (nextIdx >= s.meditation.cues.length) return { ...s, done: true };
        return {
          ...s,
          cueIdx: nextIdx,
          remaining: s.meditation.cues[nextIdx].seconds,
        };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  if (!session) {
    return (
      <div className="space-y-3">
        {MEDITATIONS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() =>
              setSession({
                meditation: m,
                cueIdx: -1,
                remaining: 2,
                paused: false,
                done: false,
              })
            }
            className="w-full text-left rounded-xl bg-card border border-line-soft/70 px-5 py-4 hover:border-gold/50 transition"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-[14.5px] font-medium text-cream">
                {m.title}
              </div>
              <div className="text-[11px] text-cream-mute tabular-nums shrink-0">
                {fmtMin(meditationDuration(m))}
              </div>
            </div>
            <div className="text-[12px] text-cream-dim mt-0.5">{m.tagline}</div>
            <div className="text-[10.5px] text-cream-mute mt-1.5">
              {m.audioSrc ? "Guided by Christian (audio)" : "Guided text"}
            </div>
          </button>
        ))}
        <p className="text-[11.5px] text-cream-mute leading-relaxed pt-1">
          Somewhere you won&apos;t be interrupted is ideal. Somewhere you
          might be is fine too.
        </p>
      </div>
    );
  }

  const m = session.meditation;
  const total = meditationDuration(m);
  const elapsed =
    m.cues.slice(0, Math.max(session.cueIdx, 0)).reduce((a, c) => a + c.seconds, 0) +
    (session.cueIdx >= 0 ? m.cues[session.cueIdx].seconds - session.remaining : 0);
  const progress = session.done ? 1 : Math.min(elapsed / total, 1);
  const cueText = session.done
    ? "That's the whole practice. Come back any time."
    : session.cueIdx === -1
      ? "Ready…"
      : m.cues[session.cueIdx].text;

  // Recorded mode: hand playback to the audio element, keep the script
  // visible underneath for reading along.
  if (m.audioSrc) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-[13px] text-cream-dim">{m.title}</div>
        <audio className="mt-5 w-full" controls autoPlay src={m.audioSrc} />
        <div className="mt-6 space-y-2 text-[12.5px] text-cream-dim leading-relaxed">
          {m.cues.map((c, i) => (
            <p key={i}>{c.text}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSession(null)}
          className="mt-6 rounded-full border border-line-soft bg-card px-5 py-2 text-[12.5px] text-cream hover:border-gold/50 transition"
        >
          Done
        </button>
      </div>
    );
  }

  const R = 108;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center">
      <div className="text-[13px] text-cream-dim">{m.title}</div>

      <div className="relative size-[240px] my-8 grid place-items-center">
        <svg viewBox="0 0 240 240" className="absolute inset-0 -rotate-90">
          <circle
            cx="120"
            cy="120"
            r={R}
            fill="none"
            className="stroke-gold/15"
            strokeWidth="3"
          />
          <circle
            cx="120"
            cy="120"
            r={R}
            fill="none"
            className="stroke-gold/70"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="px-8 text-center">
          <p className="text-[14.5px] text-cream leading-relaxed">{cueText}</p>
        </div>
      </div>

      <div className="text-[12px] text-cream-mute tabular-nums">
        {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} /{" "}
        {Math.floor(total / 60)}:{String(total % 60).padStart(2, "0")}
      </div>

      <div className="mt-5 flex items-center gap-3">
        {!session.done && (
          <button
            type="button"
            onClick={() =>
              setSession((s) => (s ? { ...s, paused: !s.paused } : s))
            }
            className="rounded-full bg-gold text-[#1a1a1a] px-5 py-2 text-[12.5px] font-semibold hover:bg-gold-bright transition"
          >
            {session.paused ? "Resume" : "Pause"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setSession(null)}
          className="rounded-full border border-line-soft bg-card px-5 py-2 text-[12.5px] text-cream hover:border-gold/50 transition"
        >
          {session.done ? "Back to the list" : "Stop"}
        </button>
      </div>
    </div>
  );
}
