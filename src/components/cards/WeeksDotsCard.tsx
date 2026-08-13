"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";
import { ChevronRightIcon } from "../icons";

const TOTAL_WEEKS = 4000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// The 4,000 Weeks horizon (Christian's design, 2026-08-12/13): the couple's
// ring plus each partner's life in weeks, dot-grid style. Every dot on a
// person's grid is one week in one of three states: lived before the two
// of you (dim), lived together (gold), still ahead (empty). Honest math
// only, framed as a horizon and never a forecast.

export type WeeksPerson = {
  name: string; // "You" for the viewer
  birthday: string | null; // YYYY-MM-DD
};

type LifeWeeks = {
  lived: number;
  left: number;
  together: number; // most recent lived weeks, capped at sharedWeeks
  before: number;
};

function weeksSince(iso: string): number {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(`${iso}T12:00:00`).getTime()) / WEEK_MS),
  );
}

function lifeWeeks(p: WeeksPerson, sharedWeeks: number | null): LifeWeeks | null {
  if (!p.birthday) return null;
  const lived = Math.min(TOTAL_WEEKS, weeksSince(p.birthday));
  const together = Math.min(sharedWeeks ?? 0, lived);
  return {
    lived,
    left: TOTAL_WEEKS - lived,
    together,
    before: lived - together,
  };
}

const DOT = { before: "#5b554b", together: "#c8963e", ahead: "#2f2f2f" };

function stateAt(week: number, w: LifeWeeks): keyof typeof DOT {
  if (week < w.before) return "before";
  if (week < w.lived) return "together";
  return "ahead";
}

// Compact calendar of dots for the card face: 20 columns by 8 rows, each
// dot standing for 25 weeks of the viewer's 4,000. Wraps like a calendar,
// never overflows the card.
function LifeCalendar({ weeks }: { weeks: LifeWeeks }) {
  const COLS = 20;
  const ROWS = 8;
  const BLOCK = TOTAL_WEEKS / (COLS * ROWS);
  return (
    <div
      className="grid gap-[3px] w-full"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const mid = Math.floor(i * BLOCK + BLOCK / 2);
        return (
          <span
            key={i}
            className="aspect-square w-full rounded-full"
            style={{ backgroundColor: DOT[stateAt(mid, weeks)] }}
          />
        );
      })}
    </div>
  );
}

// The full life-in-weeks grid: 52 dots per row, one row per year of the
// 4,000-week horizon. Rendered only while the sheet is open.
function LifeGrid({ weeks }: { weeks: LifeWeeks }) {
  const COLS = 52;
  const rows = Math.ceil(TOTAL_WEEKS / COLS); // 77
  return (
    <svg
      viewBox={`0 0 ${COLS} ${rows}`}
      className="w-full"
      style={{ aspectRatio: `${COLS} / ${rows}` }}
      aria-hidden="true"
    >
      {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
        <rect
          key={i}
          x={i % COLS}
          y={Math.floor(i / COLS)}
          width={0.72}
          height={0.72}
          rx={0.36}
          fill={DOT[stateAt(i, weeks)]}
        />
      ))}
    </svg>
  );
}

function Legend() {
  const items: { key: keyof typeof DOT; label: string }[] = [
    { key: "before", label: "before us" },
    { key: "together", label: "together" },
    { key: "ahead", label: "ahead" },
  ];
  return (
    <div className="flex items-center gap-4 text-[10.5px] text-cream-mute">
      {items.map(({ key, label }) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span
            className="size-[7px] rounded-full"
            style={{ backgroundColor: DOT[key] }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

export function WeeksDotsCard({
  sharedWeeks,
  me,
  partner,
}: {
  sharedWeeks: number | null;
  me: WeeksPerson;
  partner: WeeksPerson | null;
}) {
  const [open, setOpen] = useState(false);

  const shared = sharedWeeks;

  const mine = lifeWeeks(me, sharedWeeks);
  const theirs = partner ? lifeWeeks(partner, sharedWeeks) : null;
  const togetherAhead =
    mine && theirs ? Math.min(mine.left, theirs.left) : null;

  const faceLine = (() => {
    if (togetherAhead !== null)
      return `about ${togetherAhead.toLocaleString()} weeks still ahead, together`;
    if (shared !== null)
      return `${Math.max(0, TOTAL_WEEKS - shared).toLocaleString()} of 4,000 still ahead`;
    return "Add your together-since date to count them";
  })();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left w-full h-full"
        aria-label="About 4,000 Weeks"
      >
        <Card className="flex flex-col min-h-[230px] h-full hover:border-gold/40 transition cursor-pointer">
          <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
            4,000 Weeks
          </div>
          <div className="text-[13px] text-cream-dim mt-0.5">
            A life, in weeks
          </div>

          <div className="mt-3 space-y-1 text-[11px]">
            <div className="flex justify-between gap-3">
              <span className="text-cream-mute">Weeks together</span>
              <span className="text-cream tabular-nums">
                {shared !== null ? shared.toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-cream-mute">Weeks left, together</span>
              <span className="text-cream tabular-nums">
                {togetherAhead !== null
                  ? togetherAhead.toLocaleString()
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-cream-mute">Weeks lived, you</span>
              <span className="text-cream tabular-nums">
                {mine ? mine.lived.toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-cream-mute">Weeks left, you</span>
              <span className="text-cream tabular-nums">
                {mine ? mine.left.toLocaleString() : "—"}
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-end mt-3">
            {mine ? (
              <LifeCalendar weeks={mine} />
            ) : (
              <p className="text-[10.5px] text-cream-mute leading-snug">
                {faceLine}
              </p>
            )}
          </div>
        </Card>
      </button>

      <DetailSheet
        open={open}
        onClose={() => setOpen(false)}
        label="Perspective"
        title="4,000 Weeks"
      >
        <DepthSection heading="What this is">
          A human life runs about four thousand weeks. The ring counts the
          weeks you have spent together. Each grid below is one of your
          lives, one dot per week: the weeks before the two of you, the
          weeks together, and the weeks still ahead. It is a framing device,
          not a prediction about anyone. The point is that weeks are the
          actual unit a life together is made of.
        </DepthSection>

        <DepthSection heading="Together so far">
          <div className="flex justify-between gap-4">
            <span>Weeks together</span>
            <span className="text-cream tabular-nums">
              {shared !== null ? shared.toLocaleString() : "—"}
            </span>
          </div>
          {togetherAhead !== null && (
            <div className="flex justify-between gap-4 mt-1.5">
              <span>Weeks still ahead, together</span>
              <span className="text-cream tabular-nums">
                {togetherAhead.toLocaleString()}
              </span>
            </div>
          )}
        </DepthSection>

        {mine || theirs ? (
          <>
            <div className="mb-4">
              <Legend />
            </div>
            {mine && (
              <DepthSection heading={`${me.name} · a life in weeks`}>
                <LifeGrid weeks={mine} />
                <div className="mt-2 flex justify-between text-[11px] text-cream-mute">
                  <span>
                    {mine.lived.toLocaleString()} lived ·{" "}
                    {mine.together.toLocaleString()} together
                  </span>
                  <span className="text-cream-dim tabular-nums">
                    {mine.left.toLocaleString()} ahead
                  </span>
                </div>
              </DepthSection>
            )}
            {partner && theirs && (
              <DepthSection heading={`${partner.name} · a life in weeks`}>
                <LifeGrid weeks={theirs} />
                <div className="mt-2 flex justify-between text-[11px] text-cream-mute">
                  <span>
                    {theirs.lived.toLocaleString()} lived ·{" "}
                    {theirs.together.toLocaleString()} together
                  </span>
                  <span className="text-cream-dim tabular-nums">
                    {theirs.left.toLocaleString()} ahead
                  </span>
                </div>
              </DepthSection>
            )}
            {partner && !theirs && (
              <DepthSection heading={`${partner.name}`}>
                <p>
                  {partner.name} hasn&apos;t added their birthday yet. Their
                  grid appears when they do.
                </p>
              </DepthSection>
            )}
          </>
        ) : (
          <DepthSection heading="Each of you">
            <p>
              Add your birthdays and each of your lives appears here as a
              grid of weeks: before us, together, and ahead.
            </p>
          </DepthSection>
        )}
        {!me.birthday && (
          <Link
            href="/account"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-gold hover:text-gold-bright transition"
          >
            Add your birthday
            <ChevronRightIcon className="size-3" />
          </Link>
        )}

        {togetherAhead !== null && (
          <DepthSection heading="The horizon you share">
            <p className="text-[12px] text-cream-mute leading-relaxed">
              Your shared horizon runs to the nearer edge of your two
              four-thousand-week lives. Not a forecast: a reason to spend
              this week like it counts, because it does.
            </p>
          </DepthSection>
        )}
      </DetailSheet>
    </>
  );
}
