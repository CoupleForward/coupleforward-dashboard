"use client";

import { useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";
import type { ScoreWeek } from "@/lib/lab/data";

const MAX = 100;

// score: 0–100 (average of each partner's latest closeness rating × 10),
// or null before the first completed huddle. Click opens the depth view —
// where the number comes from, both partners' reads, and the history.
export function ConnectionScoreCard({
  score,
  latest,
  history,
}: {
  score: number | null;
  latest: { name: string; score: number }[];
  history: ScoreWeek[];
}) {
  const [open, setOpen] = useState(false);

  // Half-circle gauge: arc spans 180deg.
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;

  const value = score ?? 0;
  const fraction = Math.max(0, Math.min(1, value / MAX));
  const angle = Math.PI * (1 - fraction);
  const fillX = cx + radius * Math.cos(angle);
  const fillY = cy - radius * Math.sin(angle);
  const largeArc = fraction > 0.5 ? 1 : 0;

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
        className="text-left w-full"
        aria-label="About your Connection Score"
      >
        <Card className="flex flex-col min-h-[170px] hover:border-gold/40 transition cursor-pointer">
          <div className="text-[13px] text-cream-dim">Connection Score</div>

          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <svg
                viewBox="0 0 180 110"
                className="w-[180px] h-[110px] overflow-visible"
                aria-hidden="true"
              >
                <path
                  d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
                  fill="none"
                  stroke="#3a3a3a"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {fraction > 0 && (
                  <path
                    d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${fillX} ${fillY}`}
                    fill="none"
                    stroke="#c8963e"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute inset-x-0 bottom-1 text-center">
                {score === null ? (
                  <span className="text-[12px] text-cream-mute">
                    Complete a Huddle
                  </span>
                ) : (
                  <>
                    <span className="text-[26px] font-semibold text-cream tabular-nums">
                      {value}
                    </span>
                    <span className="text-cream-mute text-[13px]">/{MAX}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-cream-mute text-center">
            Tap for what this means
          </div>
        </Card>
      </button>

      <DetailSheet
        open={open}
        onClose={() => setOpen(false)}
        label="Your numbers"
        title="Connection Score"
      >
        <DepthSection heading="What this is">
          Each week in the Huddle, each of you rates how close you felt, 1
          to 10. This score is the latest rating times ten, averaged between
          you once you are both here. It is your weekly pulse, in your own
          words. It is not a verdict on your relationship.
        </DepthSection>

        {latest.length > 0 && (
          <DepthSection heading="The latest reads">
            <div className="space-y-1.5">
              {latest.map((m, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <span>{m.name}</span>
                  <span className="text-cream tabular-nums">
                    {m.score}/10
                  </span>
                </div>
              ))}
            </div>
            {latest.length === 2 && Math.abs(latest[0].score - latest[1].score) >= 2 && (
              <p className="mt-3 text-[12px] text-cream-mute leading-relaxed">
                You two are reading this week differently. That gap is not a
                problem to fix: it is information, and worth a conversation.
              </p>
            )}
          </DepthSection>
        )}

        {history.length > 0 ? (
          <DepthSection heading="Week by week">
            <div className="space-y-1.5">
              {[...history].reverse().map((w) => (
                <div
                  key={w.week_start}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-cream-mute">
                    {fmtWeek(w.week_start)}
                  </span>
                  <span className="flex-1 text-right text-[12px] text-cream-mute">
                    {w.byMember
                      .map((m) => `${m.name} ${m.score}`)
                      .join(" · ")}
                  </span>
                  <span className="w-10 text-right text-cream tabular-nums">
                    {Math.round(w.avg * 10)}
                  </span>
                </div>
              ))}
            </div>
          </DepthSection>
        ) : (
          <DepthSection heading="Week by week">
            Your history starts with your first completed Huddle.
          </DepthSection>
        )}

        <DepthSection heading="What tends to move it">
          Not grand gestures. Repair speed, feeling heard in the Ask stage,
          and the small rituals actually happening. Watch the trend across
          weeks, not any single number.
        </DepthSection>
      </DetailSheet>
    </>
  );
}
