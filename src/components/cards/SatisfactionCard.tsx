import { Card } from "../Card";

// series: one point per completed huddle — average closeness × 10, oldest
// first. Needs at least two points to draw a trend.
export function SatisfactionCard({ series }: { series: number[] }) {
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

  return (
    <Card className="flex flex-col min-h-[230px]">
      <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
        Satisfaction
      </div>
      <div className="text-[13px] text-cream-dim mt-0.5">
        Relationship index
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
  );
}
