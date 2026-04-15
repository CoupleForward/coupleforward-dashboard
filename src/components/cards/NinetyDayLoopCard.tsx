import { Card } from "../Card";

const categories = [
  "Holidays",
  "Special Occasions",
  "Experiences & Travel",
  "Couple Goals",
  "Personal Goals",
];

// Concentric arc rings — decorative, evokes the printed 90 Day Loop protocol.
const rings = [
  { r: 46, dash: 72, opacity: 0.95 },
  { r: 38, dash: 68, opacity: 0.82 },
  { r: 30, dash: 62, opacity: 0.68 },
  { r: 22, dash: 54, opacity: 0.55 },
  { r: 14, dash: 44, opacity: 0.42 },
];

export function NinetyDayLoopCard() {
  return (
    <Card className="flex flex-col min-h-[230px] relative overflow-hidden">
      {/* Decorative concentric arcs */}
      <div className="absolute -right-10 -top-8 pointer-events-none">
        <svg
          width="200"
          height="200"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {rings.map((ring) => (
            <circle
              key={ring.r}
              cx="50"
              cy="50"
              r={ring.r}
              fill="none"
              stroke="#c8963e"
              strokeWidth="2.4"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${ring.dash} 100`}
              strokeDashoffset="18"
              opacity={ring.opacity}
              transform="rotate(-95 50 50)"
            />
          ))}
        </svg>
      </div>

      <div className="relative flex flex-col h-full">
        <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
          The
        </div>
        <div className="text-[22px] font-semibold text-cream leading-tight mt-0.5">
          90 Day Loop
        </div>
        <div className="text-[9px] tracking-[0.22em] uppercase text-gold mt-0.5">
          protocol
        </div>

        <ul className="mt-auto space-y-1 text-[10.5px] text-cream-dim">
          {categories.map((c) => (
            <li key={c} className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-gold shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
