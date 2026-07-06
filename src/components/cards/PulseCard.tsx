import { Card } from "../Card";
import type { Huddle } from "@/lib/lab/types";
import type { PlanKey } from "@/lib/huddle";

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
export function PulseCard({
  current,
  previous,
}: {
  current: Huddle | null;
  previous: Huddle | null;
}) {
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

  return (
    <Card className="flex flex-col min-h-[230px]">
      <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
        Weekly Pulse
      </div>
      <div className="text-[13px] text-cream-dim mt-0.5">
        Rituals this week
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
  );
}
