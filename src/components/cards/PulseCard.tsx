import { Card } from "../Card";

// Placeholder metrics — swap for live huddle / ritual data later.
const metrics = [
  { label: "6-sec Hugs", value: "14", delta: "+2" },
  { label: "Deep Talks", value: "3", delta: "+1" },
  { label: "Dinners", value: "5", delta: "—" },
  { label: "Adventures", value: "1", delta: "=" },
];

export function PulseCard() {
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
                  m.delta.startsWith("+")
                    ? "text-gold"
                    : "text-cream-mute"
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
