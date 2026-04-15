import { Card, CardLabel } from "../Card";
import { PlayIcon } from "../icons";

export function SomaticToolsCard() {
  return (
    <Card>
      <CardLabel>Somatic Tools</CardLabel>
      <div className="mt-3 flex items-center gap-3">
        {/* faux animated breath circle */}
        <div className="relative size-12 shrink-0">
          <div className="absolute inset-0 rounded-full border border-gold/40" />
          <div className="absolute inset-1.5 rounded-full border border-gold/30" />
          <div className="absolute inset-3 rounded-full bg-gold/20" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold tracking-[0.12em] text-cream">
            BREATHWORK
          </div>
          <div className="text-[11px] text-cream-mute leading-tight mt-0.5">
            Box Breathing · 4-7-8 · Physiological Sigh
          </div>
        </div>
        <button
          type="button"
          className="size-9 rounded-full bg-gold text-[#1a1a1a] grid place-items-center hover:bg-gold-bright transition shrink-0"
          aria-label="Start breathwork"
        >
          <PlayIcon className="size-4 ml-0.5" />
        </button>
      </div>
    </Card>
  );
}
