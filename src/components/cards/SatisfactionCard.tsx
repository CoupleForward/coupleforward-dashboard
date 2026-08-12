"use client";

import { useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";
import type { ScoreWeek } from "@/lib/lab/data";

// One point per completed huddle — average closeness × 10, oldest first.
// Click opens the depth view with the week-by-week source data.
export function SatisfactionCard({ detail }: { detail: ScoreWeek[] }) {
  const [open, setOpen] = useState(false);

  const series = detail.map((p) => p.avg * 10);
  const hasTrend = series.length >= 2;
  const current = hasTrend ? series[series.length - 1] : null;
  const prev = hasTrend ? series[series.length - 2] : null;
  const delta = current !== null && prev !== null ? current - prev : 0;

  const width = 220;
  const height = 70;
  const padX = 6;
  const padY = 8;

  let linePath = "";
  let areaPath = "";
  if (hasTrend) {
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const points = series.map((v, i) => {
      const x = padX + (i * (width - padX * 2)) / (series.length - 1);
      const y = height - padY - ((v - min) / range) * (height - padY * 2);
      return [x, y] as const;
    });
    linePath = points
      .map(
        ([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`,
      )
      .join(" ");
    areaPath = `${linePath} L ${points[points.length - 1][0].toFixed(
      1,
    )} ${height} L ${points[0][0].toFixed(1)} ${height} Z`;
  }

  const fmtWeek = (w: string) =>
    new Date(`${w}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left w-full h-full"
        aria-label="About your Satisfaction trend"
      >
        <Card className="flex flex-col min-h-[230px] h-full hover:border-gold/40 transition cursor-pointer">
          <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
            Satisfaction
          </div>
          <div className="text-[13px] text-cream-dim mt-0.5">
            Your closeness, over time
          </div>

          {hasTrend ? (
            <>
              <div className="flex items-baseline gap-2 mt-3">
                <div className="text-[34px] font-semibold text-cream leading-none tabular-nums">
                  {Math.round(current!)}
                </div>
                <div
                  className={`text-[11px] tabular-nums ${
                    delta >= 0 ? "text-gold" : "text-cream-mute"
                  }`}
                >
                  {delta >= 0 ? "+" : ""}
                  {Math.round(delta)}
                </div>
              </div>
              <div className="text-[9px] tracking-[0.14em] uppercase text-cream-mute mt-1">
                From your huddles
              </div>

              <div className="flex-1 flex items-end mt-3">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="satFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#c8963e" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#c8963e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#satFill)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#c8963e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[12px] text-cream-mute text-center leading-snug px-2">
                Your trend appears after a couple of completed Huddles.
              </p>
            </div>
          )}
        </Card>
      </button>

      <DetailSheet
        open={open}
        onClose={() => setOpen(false)}
        label="Your numbers"
        title="Satisfaction"
      >
        <DepthSection heading="What this is">
          The same closeness ratings as your Connection Score, seen over
          time: one point per completed Huddle, averaged between you. The
          line matters more than any point on it.
        </DepthSection>

        {detail.length > 0 ? (
          <DepthSection heading="The points on the line">
            <div className="space-y-1.5">
              {[...detail].reverse().map((w) => (
                <div
                  key={w.week_start}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-cream-mute">
                    {fmtWeek(w.week_start)}
                  </span>
                  <span className="flex-1 text-right text-[12px] text-cream-mute">
                    {w.byMember.map((m) => `${m.name} ${m.score}`).join(" · ")}
                  </span>
                  <span className="w-10 text-right text-cream tabular-nums">
                    {Math.round(w.avg * 10)}
                  </span>
                </div>
              ))}
            </div>
          </DepthSection>
        ) : (
          <DepthSection heading="The points on the line">
            No completed Huddles yet. The line starts with your first one.
          </DepthSection>
        )}

        <DepthSection heading="Reading it honestly">
          Dips are normal and usually mean a hard week, not a failing
          relationship. What matters is whether dips recover: the presence
          of repair, not the absence of hard weeks.
        </DepthSection>
      </DetailSheet>
    </>
  );
}
