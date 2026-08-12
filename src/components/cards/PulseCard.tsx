"use client";

import { useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";
import type { Huddle } from "@/lib/lab/types";
import { RITUAL_CALENDAR_TITLES, type PlanKey } from "@/lib/huddle";

function slotCount(h: Huddle | null, key: PlanKey): number {
  const item = h?.plan?.[key];
  if (!item?.committed) return 0;
  return item.slots?.length ?? 1;
}

function fmtDelta(cur: number, prev: number | null): string {
  if (prev === null) return "—";
  const d = cur - prev;
  if (d > 0) return `+${d}`;
  if (d === 0) return "=";
  return `${d}`;
}

// Live counts from this week's huddle, with deltas vs last week's.
// Click opens the full ritual-by-ritual breakdown.
export function PulseCard({
  current,
  previous,
}: {
  current: Huddle | null;
  previous: Huddle | null;
}) {
  const [open, setOpen] = useState(false);

  const prevOr = (v: number): number | null => (previous ? v : null);
  const metrics = [
    {
      label: "6-sec Hugs",
      value: current?.hug_count ?? 0,
      delta: fmtDelta(current?.hug_count ?? 0, prevOr(previous?.hug_count ?? 0)),
    },
    {
      label: "Deep Talks",
      value: slotCount(current, "convos"),
      delta: fmtDelta(
        slotCount(current, "convos"),
        prevOr(slotCount(previous, "convos")),
      ),
    },
    {
      label: "Dinners",
      value: slotCount(current, "dinners"),
      delta: fmtDelta(
        slotCount(current, "dinners"),
        prevOr(slotCount(previous, "dinners")),
      ),
    },
    {
      label: "Adventures",
      value: slotCount(current, "adventure"),
      delta: fmtDelta(
        slotCount(current, "adventure"),
        prevOr(slotCount(previous, "adventure")),
      ),
    },
  ];

  const allKeys = Object.keys(RITUAL_CALENDAR_TITLES) as PlanKey[];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left w-full h-full"
        aria-label="About your Weekly Pulse"
      >
        <Card className="flex flex-col min-h-[230px] h-full hover:border-gold/40 transition cursor-pointer">
          <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
            Weekly Pulse
          </div>
          <div className="text-[13px] text-cream-dim mt-0.5">
            Planned this week
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 flex-1">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg bg-card-2/60 border border-line-soft/60 px-2.5 py-2 flex flex-col justify-between"
              >
                <div className="flex items-baseline gap-1.5">
                  <div className="text-[20px] font-semibold text-cream leading-none tabular-nums">
                    {m.value}
                  </div>
                  <div
                    className={`text-[9.5px] tabular-nums ${
                      m.delta.startsWith("+") ? "text-gold" : "text-cream-mute"
                    }`}
                  >
                    {m.delta}
                  </div>
                </div>
                <div className="text-[9px] tracking-[0.12em] uppercase text-cream-mute mt-1.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </button>

      <DetailSheet
        open={open}
        onClose={() => setOpen(false)}
        label="Your numbers"
        title="Weekly Pulse"
      >
        <DepthSection heading="What this is">
          What you committed to in this week&apos;s Huddle plan, counted.
          Hugs come from the counter in the Reflect stage; the rest are the
          time slots you actually scheduled. This measures the rhythm you
          set, not how the week felt.
        </DepthSection>

        <DepthSection heading="This week's full plan">
          {current ? (
            <div className="space-y-1.5">
              <div className="flex justify-between gap-4">
                <span>Six-second hugs</span>
                <span className="text-cream tabular-nums">
                  {current.hug_count}
                </span>
              </div>
              {allKeys.map((k) => {
                const cur = slotCount(current, k);
                const prev = previous ? slotCount(previous, k) : null;
                return (
                  <div key={k} className="flex justify-between gap-4">
                    <span>{RITUAL_CALENDAR_TITLES[k]}</span>
                    <span className="text-cream tabular-nums">
                      {cur}
                      {prev !== null && (
                        <span className="text-cream-mute text-[11px]">
                          {" "}
                          (previous Huddle {prev})
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>
              No Huddle yet this week. The pulse fills in as soon as you
              plan one.
            </p>
          )}
        </DepthSection>

        <DepthSection heading="Reading it honestly">
          A lighter week is not a failing grade. The pulse exists so a
          quiet drift gets noticed in week two, not month three.
        </DepthSection>
      </DetailSheet>
    </>
  );
}
