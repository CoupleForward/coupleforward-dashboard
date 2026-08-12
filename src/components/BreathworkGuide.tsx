"use client";

// A real, working breath pacer. Pure client — no data leaves the device.
// Three patterns; the circle scales with the phase and the label counts
// down. Stop any time.

import { useEffect, useState } from "react";

type Phase = {
  label: string;
  seconds: number;
  // Circle scale target for this phase: 1 = full, 0 = small.
  target: number;
};

type Pattern = {
  key: string;
  name: string;
  tagline: string;
  phases: Phase[];
};

const PATTERNS: Pattern[] = [
  {
    key: "box",
    name: "Box Breathing",
    tagline: "Four sides, four counts each. Steadies the system under load.",
    phases: [
      { label: "Breathe in", seconds: 4, target: 1 },
      { label: "Hold", seconds: 4, target: 1 },
      { label: "Breathe out", seconds: 4, target: 0 },
      { label: "Hold", seconds: 4, target: 0 },
    ],
  },
  {
    key: "478",
    name: "4-7-8",
    tagline: "Long exhale. The brake pedal for a revved nervous system.",
    phases: [
      { label: "Breathe in", seconds: 4, target: 1 },
      { label: "Hold", seconds: 7, target: 1 },
      { label: "Breathe out", seconds: 8, target: 0 },
    ],
  },
  {
    key: "sigh",
    name: "Physiological Sigh",
    tagline:
      "Two inhales, one long exhale. A fast, reliable downshift. Use it mid-moment.",
    phases: [
      { label: "Breathe in", seconds: 2, target: 0.75 },
      { label: "Top it off", seconds: 1, target: 1 },
      { label: "Long exhale", seconds: 6, target: 0 },
    ],
  },
];

type Session = {
  pattern: Pattern;
  // -1 is a one-second "Ready" beat so the circle starts small and the
  // first inhale actually animates.
  phaseIdx: number;
  remaining: number;
  cycles: number;
};

export function BreathworkGuide() {
  const [session, setSession] = useState<Session | null>(null);
  const running = session !== null;

  // One interval drives the whole session; all state moves in its callback.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSession((s) => {
        if (!s) return s;
        if (s.remaining > 1) return { ...s, remaining: s.remaining - 1 };
        const nextIdx =
          s.phaseIdx === -1 ? 0 : (s.phaseIdx + 1) % s.pattern.phases.length;
        return {
          ...s,
          phaseIdx: nextIdx,
          remaining: s.pattern.phases[nextIdx].seconds,
          cycles: s.phaseIdx !== -1 && nextIdx === 0 ? s.cycles + 1 : s.cycles,
        };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  if (!session) {
    return (
      <div className="space-y-3">
        {PATTERNS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() =>
              setSession({
                pattern: p,
                phaseIdx: -1,
                remaining: 1,
                cycles: 0,
              })
            }
            className="w-full text-left rounded-xl bg-card border border-line-soft/70 px-5 py-4 hover:border-gold/50 transition"
          >
            <div className="text-[14.5px] font-medium text-cream">
              {p.name}
            </div>
            <div className="text-[12px] text-cream-dim mt-0.5">
              {p.tagline}
            </div>
            <div className="text-[10.5px] text-cream-mute mt-1.5 tabular-nums">
              {p.phases.map((ph) => `${ph.label} ${ph.seconds}`).join(" · ")}
            </div>
          </button>
        ))}
        <p className="text-[11.5px] text-cream-mute leading-relaxed pt-1">
          Two to five minutes is plenty. If you feel lightheaded, stop and
          breathe normally.
        </p>
      </div>
    );
  }

  const ready = session.phaseIdx === -1;
  const phase = ready
    ? { label: "Ready", seconds: 1, target: 0 }
    : session.pattern.phases[session.phaseIdx];
  const scale = 0.45 + phase.target * 0.55;

  return (
    <div className="flex flex-col items-center">
      <div className="text-[13px] text-cream-dim">{session.pattern.name}</div>

      <div className="relative size-[240px] my-8 grid place-items-center">
        {/* Guide rings */}
        <div className="absolute inset-0 rounded-full border border-gold/20" />
        <div className="absolute inset-6 rounded-full border border-gold/15" />
        {/* Breathing circle */}
        <div
          className="rounded-full bg-gold/25 border border-gold/60"
          style={{
            width: 200,
            height: 200,
            transform: `scale(${scale})`,
            transition: `transform ${phase.seconds}s ease-in-out`,
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[17px] font-medium text-cream">
            {phase.label}
          </div>
          <div className="text-[30px] font-semibold text-gold tabular-nums leading-tight">
            {session.remaining}
          </div>
        </div>
      </div>

      <div className="text-[12px] text-cream-mute tabular-nums">
        {session.cycles} {session.cycles === 1 ? "cycle" : "cycles"} complete
      </div>

      <button
        type="button"
        onClick={() => setSession(null)}
        className="mt-5 rounded-full border border-line-soft bg-card px-5 py-2 text-[12.5px] text-cream hover:border-gold/50 transition"
      >
        Stop
      </button>
    </div>
  );
}
