"use client";

// The daily lines: each partner's mood over the last 14 days plus the
// blended couple connection score. The average never hides the gap: when
// partners read a day differently, the spread is shown as its own signal
// (spec: docs/plan/05, weighting default).

import { useMemo, useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";
import type { DailyCheckin } from "@/lib/lab/types";

const DAYS = 14;

type DayPoint = {
  day: string;
  byUser: Record<string, DailyCheckin>;
};

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(
      `${x.getFullYear()}-${(x.getMonth() + 1).toString().padStart(2, "0")}-${x
        .getDate()
        .toString()
        .padStart(2, "0")}`,
    );
  }
  return out;
}

function Sparkline({
  points,
  color,
  band,
}: {
  points: (number | null)[];
  color: string;
  band?: (number | null)[]; // optional gap band (absolute diff at each point)
}) {
  const width = 220;
  const height = 44;
  const padY = 4;
  const x = (i: number) =>
    points.length > 1 ? (i * width) / (points.length - 1) : width / 2;
  const y = (v: number) => height - padY - ((v - 1) / 9) * (height - padY * 2);

  const segments: string[] = [];
  let current = "";
  points.forEach((v, i) => {
    if (v === null) {
      if (current) segments.push(current);
      current = "";
      return;
    }
    current += `${current ? "L" : "M"} ${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
  });
  if (current) segments.push(current);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-11"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {band &&
        points.map((v, i) =>
          v !== null && band[i] !== null && band[i]! > 0 ? (
            <line
              key={i}
              x1={x(i)}
              x2={x(i)}
              y1={y(Math.min(10, v + band[i]! / 2))}
              y2={y(Math.max(1, v - band[i]! / 2))}
              stroke={color}
              strokeOpacity="0.25"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : null,
        )}
      {segments.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {points.map((v, i) =>
        v !== null ? (
          <circle key={`c${i}`} cx={x(i)} cy={y(v)} r="2" fill={color} />
        ) : null,
      )}
    </svg>
  );
}

export function DailyTrendsCard({
  recent,
  userId,
  memberNames,
}: {
  recent: DailyCheckin[];
  userId: string;
  memberNames: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  const days = useMemo(() => lastNDays(DAYS), []);
  const byDay: DayPoint[] = useMemo(
    () =>
      days.map((day) => ({
        day,
        byUser: Object.fromEntries(
          recent.filter((r) => r.day === day).map((r) => [r.user_id, r]),
        ),
      })),
    [days, recent],
  );

  const userIds = useMemo(() => {
    const ids = new Set<string>(recent.map((r) => r.user_id));
    ids.add(userId);
    return [...ids].sort((a) => (a === userId ? -1 : 1));
  }, [recent, userId]);

  const moodSeries = (uid: string): (number | null)[] =>
    byDay.map((d) => d.byUser[uid]?.mood ?? null);

  const connectionAvg: (number | null)[] = byDay.map((d) => {
    const vals = Object.values(d.byUser).map((r) => r.connection);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  const connectionGap: (number | null)[] = byDay.map((d) => {
    const vals = Object.values(d.byUser).map((r) => r.connection);
    if (vals.length < 2) return null;
    return Math.abs(vals[0] - vals[1]);
  });

  const nameOf = (uid: string) =>
    uid === userId ? "You" : (memberNames[uid] ?? "Partner");
  const hasAny = recent.length > 0;
  const fmtDay = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left w-full"
        aria-label="About your daily lines"
      >
        <Card className="hover:border-gold/40 transition cursor-pointer">
          <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
            The Daily Lines
          </div>
          <div className="text-[13px] text-cream-dim mt-0.5">
            Last two weeks, day by day
          </div>

          {hasAny ? (
            <div className="mt-3 space-y-3">
              {userIds.map((uid, i) => (
                <div key={uid}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] tracking-[0.14em] uppercase text-gold">
                      {nameOf(uid)} · mood
                    </span>
                  </div>
                  <Sparkline
                    points={moodSeries(uid)}
                    color={i === 0 ? "#c8963e" : "#8a8275"}
                  />
                </div>
              ))}
              <div>
                <div className="text-[10px] tracking-[0.14em] uppercase text-cream-mute">
                  Connection · blended, gap shown
                </div>
                <Sparkline
                  points={connectionAvg}
                  color="#e0ad4a"
                  band={connectionGap}
                />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-cream-mute leading-snug">
              Your lines start with your first daily check-in.
            </p>
          )}
        </Card>
      </button>

      <DetailSheet
        open={open}
        onClose={() => setOpen(false)}
        label="Your numbers"
        title="The Daily Lines"
      >
        <DepthSection heading="What this is">
          Each day you both answer three quick reads: how you feel in
          yourself, about your day, and toward each other. Mood stays
          per-person. Connection blends into one couple score, and the
          shaded band around that line is the gap between your two answers.
          A 9 and a 3 average to 6, but they are not a 6 and a 6, and this
          card refuses to pretend otherwise.
        </DepthSection>

        <DepthSection heading="Day by day">
          {hasAny ? (
            <div className="space-y-1.5">
              {[...byDay]
                .reverse()
                .filter((d) => Object.keys(d.byUser).length > 0)
                .map((d) => (
                  <div
                    key={d.day}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-cream-mute">{fmtDay(d.day)}</span>
                    <span className="text-right text-[12px]">
                      {Object.values(d.byUser).map((r) => (
                        <span key={r.id} className="ml-3">
                          {nameOf(r.user_id)}{" "}
                          <span className="text-cream tabular-nums">
                            {r.mood}/{r.happiness}/{r.connection}
                          </span>
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              <p className="pt-2 text-[11px] text-cream-mute">
                Read as mood / day / connection, each out of 10.
              </p>
            </div>
          ) : (
            <p>No check-ins yet.</p>
          )}
        </DepthSection>

        <DepthSection heading="Reading it honestly">
          These are one-tap self-reports: texture, not verdicts. Low days
          are information. A widening connection gap matters more than any
          single low number, and it is worth a conversation, not a fix.
        </DepthSection>
      </DetailSheet>
    </>
  );
}
