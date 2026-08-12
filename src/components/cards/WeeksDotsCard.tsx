"use client";

import { useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";

const TOTAL_WEEKS = 4000;

// sharedWeeks is computed by the server component from couples.together_since.
// Honest math only: "remaining" is simply 4,000 minus shared — a framing
// device from the Four Thousand Weeks idea, not a prediction about anyone.
export function WeeksDotsCard({ sharedWeeks }: { sharedWeeks: number | null }) {
  const [open, setOpen] = useState(false);

  const shared = sharedWeeks;
  const pct = shared === null ? 0 : Math.min(1, shared / TOTAL_WEEKS);
  const remaining = shared === null ? null : Math.max(0, TOTAL_WEEKS - shared);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left w-full h-full"
        aria-label="About 4,000 Weeks"
      >
        <Card className="flex flex-col min-h-[230px] h-full hover:border-gold/40 transition cursor-pointer">
          <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
            4,000 Weeks
          </div>
          <div className="text-[13px] text-cream-dim mt-0.5">
            A life, in weeks
          </div>

          <div className="flex-1 flex items-center justify-center mt-2">
            <div className="relative">
              <svg
                width="118"
                height="118"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="5"
                  className="stroke-line/60"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="5"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${(pct * 100).toFixed(2)} 100`}
                  transform="rotate(-90 50 50)"
                  className="stroke-gold"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[26px] font-semibold text-cream leading-none tabular-nums">
                  {shared ?? "—"}
                </div>
                <div className="text-[9px] tracking-[0.14em] uppercase text-cream-mute mt-1">
                  shared
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10.5px] text-cream-mute leading-snug mt-2">
            {remaining !== null
              ? `${remaining.toLocaleString()} of 4,000 still ahead`
              : "Add your together-since date to count them"}
          </div>
        </Card>
      </button>

      <DetailSheet
        open={open}
        onClose={() => setOpen(false)}
        label="Perspective"
        title="4,000 Weeks"
      >
        <DepthSection heading="What this is">
          A human life runs about four thousand weeks. This ring counts the
          ones you have already spent together, computed from your
          together-since date, against that horizon. It is a framing
          device, not a prediction: the point is that weeks are the actual
          unit a life together is made of.
        </DepthSection>

        <DepthSection heading="Your count">
          <div className="space-y-1.5">
            <div className="flex justify-between gap-4">
              <span>Weeks together so far</span>
              <span className="text-cream tabular-nums">
                {shared !== null ? shared.toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Of 4,000, still ahead</span>
              <span className="text-cream tabular-nums">
                {remaining !== null ? remaining.toLocaleString() : "—"}
              </span>
            </div>
          </div>
        </DepthSection>

        <DepthSection heading="Why it sits on your dashboard">
          The Huddle exists because a week is small enough to live on
          purpose. This number is the quiet reason to spend this one well.
        </DepthSection>
      </DetailSheet>
    </>
  );
}
