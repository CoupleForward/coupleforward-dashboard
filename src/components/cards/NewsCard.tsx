import { Card } from "../Card";

export function NewsCard() {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <div className="text-[12px] font-semibold tracking-wide text-cream">
          Couple Forward News
        </div>
        <span className="size-1.5 rounded-full bg-gold animate-pulse" />
      </div>
      <p className="mt-2 text-[11.5px] text-cream-dim leading-snug">
        <span className="text-gold">May Workshop:</span> Love Rewired · May 18,
        9AM-4PM · New app: Rescript launching June 2026 · Podcast Ep. 13 drops
        Friday
      </p>
    </Card>
  );
}
