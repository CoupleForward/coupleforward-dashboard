import { Card, CardLabel } from "../Card";
import { ExpandIcon, PlusIcon } from "../icons";

export function JournalCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardLabel>Our Journal</CardLabel>
        <button
          type="button"
          className="size-7 rounded-full grid place-items-center text-cream-mute hover:text-cream hover:bg-card-hover transition"
          aria-label="Expand journal"
        >
          <ExpandIcon className="size-3.5" />
        </button>
      </div>
      <p className="mt-3 text-[13px] text-cream-dim leading-snug line-clamp-3">
        <span className="text-cream">Apr 12</span> — We talked about the
        kitchen thing. Not the dishes. What the dishes mean…
      </p>
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-gold hover:text-gold-bright transition"
      >
        <PlusIcon className="size-3.5" />
        New Entry
      </button>
    </Card>
  );
}
