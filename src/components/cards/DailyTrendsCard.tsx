"use client";

// The daily lines, privacy-preserving: YOUR mood line (yours alone) and
// the blended couple connection line with the gap band. The partner's
// individual numbers never appear here or anywhere (spec: docs/plan/05,
// privacy model of 2026-08-12). The average never hides the gap.

import { useMemo, useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";
import { dayKey } from "@/lib/lab/week";
import type { DailySummaryRow, DailyStreaks } from "@/lib/lab/checkins";

const DAYS = 14;

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(dayKey(x));
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
  band?: (number | null)[]; // gap band: absolute spread at each point
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
  rows,
  streaks,
  hasPartner,
}: {
  rows: DailySummaryRow[];
  streaks: DailyStreaks;
  hasPartner: boolean;
}) {
  const [open, setOpen] = useState(false);

  const days = useMemo(() => lastNDays(DAYS), []);
  const byDay = useMemo(
    () => new Map(rows.map((r) => [r.day, r])),
    [rows],
  );

  const myMood: (number | null)[] = days.map(
    (d) => byDay.get(d)?.my_mood ?? null,
  );
  const blended: (number | null)[] = days.map((d) => {
    const r = byDay.get(d);
    return r?.avg_connection != null ? Number(r.avg_connection) : null;
  });
  const gap: (number | null)[] = days.map((d) => {
    const r = byDay.get(d);
    return r?.connection_gap != null ? Number(r.connection_gap) : null;
  });

  const hasAny = rows.some((r) => r.me_checked || r.partner_checked);
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
              <div>
                <div className="text-[10px] tracking-[0.14em] uppercase text-gold">
                  Your mood · only you see this
                </div>
                <Sparkline points={myMood} color="#c8963e" />
              </div>
              {hasPartner && (
                <div>
                  <div className="text-[10px] tracking-[0.14em] uppercase text-cream-mute">
                    Connection · blended, gap shown
                  </div>
                  <Sparkline points={blended} color="#e0ad4a" band={gap} />
                </div>
              )}
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
          yourself, about your day, and toward each other. Your answers are
          private to you, enforced at the database, not just hidden in the
          app. What you share is the blended connection score, and the
          shaded band around that line is the gap between your two reads. A
          9 and a 3 average to 6, but they are not a 6 and a 6, and this
          card refuses to pretend otherwise.
        </DepthSection>

        <DepthSection heading="Your days">
          {hasAny ? (
            <div className="space-y-1.5">
              {[...rows]
                .reverse()
                .filter((r) => r.me_checked || r.partner_checked)
                .slice(0, DAYS)
                .map((r) => (
                  <div
                    key={r.day}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-cream-mute">{fmtDay(r.day)}</span>
                    <span className="text-right text-[12px] text-cream-dim">
                      {r.me_checked ? (
                        <span>
                          you{" "}
                          <span className="text-cream tabular-nums">
                            {r.my_mood}/{r.my_happiness}/{r.my_connection}
                          </span>
                        </span>
                      ) : (
                        <span className="text-cream-mute">you: —</span>
                      )}
                      {hasPartner && (
                        <span className="ml-3">
                          us{" "}
                          <span className="text-cream tabular-nums">
                            {r.avg_connection != null
                              ? Number(r.avg_connection).toFixed(1)
                              : "—"}
                          </span>
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              <p className="pt-2 text-[11px] text-cream-mute">
                Your column reads mood / day / connection, each out of 10.
                The us column is the blended connection.
              </p>
            </div>
          ) : (
            <p>No check-ins yet.</p>
          )}
        </DepthSection>

        <DepthSection heading="The rhythm">
          <div className="space-y-1.5">
            <div className="flex justify-between gap-4">
              <span>Your check-in streak</span>
              <span className="text-cream tabular-nums">
                {streaks.mine} {streaks.mine === 1 ? "day" : "days"}
              </span>
            </div>
            {hasPartner && (
              <div className="flex justify-between gap-4">
                <span>Together, both checked in</span>
                <span className="text-cream tabular-nums">
                  {streaks.together}{" "}
                  {streaks.together === 1 ? "day" : "days"}
                </span>
              </div>
            )}
          </div>
          <p className="mt-3 text-[12px] text-cream-mute leading-relaxed">
            Streaks here are rhythm, same as the Huddle streak: they show
            you kept the habit, never that the relationship improved. Low
            days are information, and a widening gap matters more than any
            single low number.
          </p>
        </DepthSection>
      </DetailSheet>
    </>
  );
}
