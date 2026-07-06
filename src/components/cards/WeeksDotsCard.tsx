import { Card } from "../Card";

const TOTAL_WEEKS = 4000;
const FALLBACK_SHARED = 627;
// Projected weeks remaining together (life-expectancy based, not 4000 - shared).
const REMAINING = 1480;

// sharedWeeks is computed by the server component from couples.together_since.
export function WeeksDotsCard({ sharedWeeks }: { sharedWeeks: number | null }) {
  const shared = sharedWeeks ?? FALLBACK_SHARED;
  const pct = Math.min(1, shared / TOTAL_WEEKS);

  return (
    <Card className="flex flex-col min-h-[230px]">
      <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
        4,000 Weeks
      </div>
      <div className="text-[13px] text-cream-dim mt-0.5">A life, in weeks</div>

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
              {shared}
            </div>
            <div className="text-[9px] tracking-[0.14em] uppercase text-cream-mute mt-1">
              shared
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10.5px] text-cream-mute leading-snug mt-2">
        ~{REMAINING.toLocaleString()} weeks left together
      </div>
    </Card>
  );
}
