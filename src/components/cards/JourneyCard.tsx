import Link from "next/link";
import { Card } from "../Card";
import { ChevronRightIcon, RoadIcon } from "../icons";

// The standing invitation (docs/plan/00, Q0b). Always visible, never
// pressured: one card, one sentence, one link. The journey page carries
// the substance.
export function JourneyCard() {
  return (
    <Link href="/journey" className="block h-full">
      <Card className="h-full hover:border-gold/40 transition">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gold-soft grid place-items-center text-gold shrink-0">
            <RoadIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
              The REWIRE Journey
            </div>
            <p className="mt-1.5 text-[13px] text-cream-dim leading-snug">
              When you are ready for more than the weekly rhythm, there is a
              path. It starts with knowing where you actually are.
            </p>
            <span className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-gold">
              See the journey
              <ChevronRightIcon className="size-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
