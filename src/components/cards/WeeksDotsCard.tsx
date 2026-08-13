"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";
import { ChevronRightIcon } from "../icons";

const TOTAL_WEEKS = 4000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// The 4,000 Weeks horizon (Christian's design, 2026-08-12): the couple's
// shared weeks so far, each partner's weeks lived and weeks left against a
// four-thousand-week life, and the horizon they share: the smaller of the
// two remaining counts. Honest math only, framed as a horizon and never a
// forecast.

export type WeeksPerson = {
  name: string; // "You" for the viewer
  birthday: string | null; // YYYY-MM-DD
};

function weeksSince(iso: string): number {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(`${iso}T12:00:00`).getTime()) / WEEK_MS),
  );
}

function personWeeks(p: WeeksPerson): { lived: number; left: number } | null {
  if (!p.birthday) return null;
  const lived = weeksSince(p.birthday);
  return { lived, left: Math.max(0, TOTAL_WEEKS - lived) };
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
  const pct = shared === null ? 0 : Math.min(1, shared / TOTAL_WEEKS);

  const mine = personWeeks(me);
  const theirs = partner ? personWeeks(partner) : null;
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

          <div className="flex-1 flex items-center justify-center mt-2">
            <div className="relative">
              <svg
                width="118"
                height="118"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="5"
                  className="stroke-line/60"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="5"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${(pct * 100).toFixed(2)} 100`}
                  transform="rotate(-90 50 50)"
                  className="stroke-gold"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[26px] font-semibold text-cream leading-none tabular-nums">
                  {shared ?? "—"}
                </div>
                <div className="text-[9px] tracking-[0.14em] uppercase text-cream-mute mt-1">
                  shared
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10.5px] text-cream-mute leading-snug mt-2">
            {faceLine}
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
          A human life runs about four thousand weeks. This card counts
          yours: the weeks you have already spent together, each of your own
          weeks lived and still ahead, and the horizon you share. It is a
          framing device, not a prediction about anyone. The point is that
          weeks are the actual unit a life together is made of.
        </DepthSection>

        <DepthSection heading="Together so far">
          <div className="flex justify-between gap-4">
            <span>Weeks together</span>
            <span className="text-cream tabular-nums">
              {shared !== null ? shared.toLocaleString() : "—"}
            </span>
          </div>
        </DepthSection>

        <DepthSection heading="Each of you">
          {mine || theirs ? (
            <div className="space-y-1.5">
              {mine && (
                <>
                  <div className="flex justify-between gap-4">
                    <span>{me.name}, weeks lived</span>
                    <span className="text-cream tabular-nums">
                      {mine.lived.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>{me.name}, still ahead</span>
                    <span className="text-cream tabular-nums">
                      {mine.left.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
              {partner && theirs && (
                <>
                  <div className="flex justify-between gap-4 pt-1.5">
                    <span>{partner.name}, weeks lived</span>
                    <span className="text-cream tabular-nums">
                      {theirs.lived.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>{partner.name}, still ahead</span>
                    <span className="text-cream tabular-nums">
                      {theirs.left.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
              {partner && !theirs && (
                <p className="pt-1.5 text-[12px] text-cream-mute">
                  {partner.name} hasn&apos;t added their birthday yet.
                </p>
              )}
            </div>
          ) : (
            <p>
              Add your birthdays and this section counts each of your weeks,
              lived and ahead.
            </p>
          )}
          {!me.birthday && (
            <Link
              href="/account"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-gold hover:text-gold-bright transition"
            >
              Add your birthday
              <ChevronRightIcon className="size-3" />
            </Link>
          )}
        </DepthSection>

        {togetherAhead !== null && (
          <DepthSection heading="The horizon you share">
            <div className="flex justify-between gap-4">
              <span>Weeks still ahead, together</span>
              <span className="text-cream tabular-nums">
                {togetherAhead.toLocaleString()}
              </span>
            </div>
            <p className="mt-3 text-[12px] text-cream-mute leading-relaxed">
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
