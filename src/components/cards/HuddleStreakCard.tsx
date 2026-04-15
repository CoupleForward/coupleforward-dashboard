import Link from "next/link";
import { Card } from "../Card";
import { ChevronRightIcon, FlameIcon } from "../icons";

const STREAK = 14;
const TOTAL_DOTS = 16;

export function HuddleStreakCard() {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-gold-soft grid place-items-center text-gold shrink-0">
          <FlameIcon className="size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="text-[11.5px] text-cream-dim">Huddle Streak</div>
          <div className="text-[28px] leading-none font-semibold text-cream mt-1">
            {STREAK}{" "}
            <span className="text-cream-dim text-[15px] font-normal">
              weeks
            </span>
          </div>
          <div className="text-[9px] tracking-[0.18em] uppercase text-cream-mute mt-1.5">
            Of intentional living
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: TOTAL_DOTS }).map((_, i) => {
          const inStreak = i < STREAK;
          return (
            <span
              key={i}
              className={`size-[6px] rounded-full ${
                inStreak ? "bg-gold" : "bg-line"
              }`}
            />
          );
        })}
      </div>

      <Link
        href="/huddle"
        className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-gold text-[#1a1a1a] px-3.5 py-2 text-[12px] font-semibold hover:bg-gold-bright transition"
      >
        Start this week&apos;s Huddle
        <ChevronRightIcon className="size-3" />
      </Link>
    </Card>
  );
}
