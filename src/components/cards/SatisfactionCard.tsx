import { Card } from "../Card";

// Sample series — placeholder data for the visual shell.
const data = [42, 48, 46, 53, 58, 56, 64, 70, 76, 82];

export function SatisfactionCard() {
  const current = data[data.length - 1];
  const prev = data[data.length - 2];
  const delta = current - prev;

  const width = 220;
  const height = 70;
  const padX = 6;
  const padY = 8;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padX + (i * (width - padX * 2)) / (data.length - 1);
    const y = height - padY - ((v - min) / range) * (height - padY * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1][0].toFixed(
    1,
  )} ${height} L ${points[0][0].toFixed(1)} ${height} Z`;

  return (
    <Card className="flex flex-col min-h-[230px]">
      <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
        Satisfaction
      </div>
      <div className="text-[13px] text-cream-dim mt-0.5">
        Relationship index
      </div>

      <div className="flex items-baseline gap-2 mt-3">
        <div className="text-[34px] font-semibold text-cream leading-none tabular-nums">
          {current}
        </div>
        <div
          className={`text-[11px] tabular-nums ${
            delta >= 0 ? "text-gold" : "text-cream-mute"
          }`}
        >
          {delta >= 0 ? "+" : ""}
          {delta}
        </div>
      </div>
      <div className="text-[9px] tracking-[0.14em] uppercase text-cream-mute mt-1">
        Last 90 days
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
    </Card>
  );
}
