import { Card } from "../Card";

const SCORE = 78;
const MAX = 100;

export function ConnectionScoreCard() {
  // Half-circle gauge: arc spans 180deg.
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;

  // Fraction filled
  const fraction = Math.max(0, Math.min(1, SCORE / MAX));
  // Angle in radians, sweeping from 180deg (left) to 0deg (right)
  const angle = Math.PI * (1 - fraction);
  const fillX = cx + radius * Math.cos(angle);
  const fillY = cy - radius * Math.sin(angle);
  const largeArc = fraction > 0.5 ? 1 : 0;

  return (
    <Card className="flex flex-col min-h-[170px]">
      <div className="text-[13px] text-cream-dim">Connection Score</div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <svg
            viewBox="0 0 180 110"
            className="w-[180px] h-[110px] overflow-visible"
            aria-hidden="true"
          >
            {/* track */}
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
              fill="none"
              stroke="#3a3a3a"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* fill */}
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${fillX} ${fillY}`}
              fill="none"
              stroke="#c8963e"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-1 text-center">
            <span className="text-[26px] font-semibold text-cream tabular-nums">
              {SCORE}
            </span>
            <span className="text-cream-mute text-[13px]">/{MAX}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
