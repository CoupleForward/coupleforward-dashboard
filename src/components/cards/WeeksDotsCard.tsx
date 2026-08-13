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
// Red belongs to anniversaries (every year, from the first). Birthdays get
// a single cream dot at the next one. The "weeks left" ring uses cream
// (#d7cdbc) hardcoded in its class below.
const MARK_RED = "#c4574d";
const MARK_CREAM = "#f5f0e8";

// Week index of one date on a life grid that starts at another.
function weeksBetween(startISO: string, eventISO: string): number {
  return Math.floor(
    (new Date(`${eventISO}T12:00:00`).getTime() -
      new Date(`${startISO}T12:00:00`).getTime()) /
      WEEK_MS,
  );
}

function stateAt(week: number, w: LifeWeeks): keyof typeof DOT {
  if (week < w.before) return "before";
  if (week < w.lived) return "together";
  return "ahead";
}

// Compact calendar of dots: 20 columns by 8 rows, each dot standing for 25
// weeks of the 4,000, colored by sequential segments. Wraps like a
// calendar, never overflows the card.
type Segment = { count: number; color: string };

function segmentColorAt(week: number, segments: Segment[]): string {
  let acc = 0;
  for (const s of segments) {
    acc += s.count;
    if (week < acc) return s.color;
  }
  return DOT.ahead;
}

function DotCalendar({
  segments,
  red = [],
  cream = [],
}: {
  segments: Segment[];
  red?: number[]; // anniversary week indices
  cream?: number[]; // next-birthday week index
}) {
  const COLS = 20;
  const ROWS = 8;
  const BLOCK = TOTAL_WEEKS / (COLS * ROWS);
  const toBlocks = (arr: number[]) =>
    new Set(
      arr
        .filter((m) => m >= 0 && m < TOTAL_WEEKS)
        .map((m) => Math.floor(m / BLOCK)),
    );
  const redBlocks = toBlocks(red);
  const creamBlocks = toBlocks(cream);
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
            style={{
              backgroundColor: redBlocks.has(i)
                ? MARK_RED
                : creamBlocks.has(i)
                  ? MARK_CREAM
                  : segmentColorAt(mid, segments),
            }}
          />
        );
      })}
    </div>
  );
}

// Two concentric rings, each clickable: gold outer = weeks so far, cream
// inner = weeks left. Tapping a ring puts its total in the center. Just
// the number, nothing else (Christian's spec, 2026-08-13).
function InteractiveRings({
  soFar,
  left,
}: {
  soFar: { value: number; pct: number };
  left: { value: number; pct: number };
}) {
  const [sel, setSel] = useState<"soFar" | "left">("soFar");

  const ring = (
    r: number,
    pct: number,
    colorClass: string,
    active: boolean,
    onClick: () => void,
    label: string,
  ) => (
    <g
      onClick={onClick}
      className="cursor-pointer"
      role="button"
      aria-label={label}
      opacity={active ? 1 : 0.4}
    >
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        strokeWidth="7"
        className="stroke-line/50"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${(Math.max(0.5, Math.min(1, pct) * 100)).toFixed(2)} 100`}
        transform="rotate(-90 50 50)"
        className={colorClass}
      />
      {/* generous invisible hit area */}
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        strokeWidth="14"
        stroke="transparent"
      />
    </g>
  );

  return (
    <div className="relative">
      <svg width="118" height="118" viewBox="0 0 100 100">
        {ring(
          43,
          soFar.pct,
          "stroke-gold",
          sel === "soFar",
          () => setSel("soFar"),
          "Weeks so far",
        )}
        {ring(
          31,
          left.pct,
          "stroke-[#d7cdbc]",
          sel === "left",
          () => setSel("left"),
          "Weeks left",
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div
          className={`text-[21px] font-semibold leading-none tabular-nums ${
            sel === "soFar" ? "text-gold" : "text-[#d7cdbc]"
          }`}
        >
          {(sel === "soFar" ? soFar.value : left.value).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

// The full life-in-weeks grid: 52 dots per row, one row per year of the
// 4,000-week horizon. Rendered only while the sheet is open. Marker weeks
// (next birthday, next anniversary) get the red dot.
function LifeGrid({
  weeks,
  red = [],
  cream = [],
}: {
  weeks: LifeWeeks;
  red?: number[]; // anniversaries, every year
  cream?: number[]; // the next birthday
}) {
  const COLS = 52;
  const rows = Math.ceil(TOTAL_WEEKS / COLS); // 77
  const inRange = (m: number) => m >= 0 && m < TOTAL_WEEKS;
  const redSet = new Set(red.filter(inRange));
  const creamSet = new Set(cream.filter(inRange));
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
          fill={
            redSet.has(i)
              ? MARK_RED
              : creamSet.has(i)
                ? MARK_CREAM
                : DOT[stateAt(i, weeks)]
          }
        />
      ))}
    </svg>
  );
}

function Legend() {
  const items: { color: string; label: string }[] = [
    { color: DOT.before, label: "before us" },
    { color: DOT.together, label: "together" },
    { color: DOT.ahead, label: "ahead" },
    { color: MARK_RED, label: "when we began" },
    { color: MARK_CREAM, label: "birth" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-cream-mute">
      {items.map(({ color, label }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span
            className="size-[7px] rounded-full"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

// The card face: a Together / You tab pair. Each tab is one double-ring
// graphic (outer arc weeks lived-or-together, inner arc weeks left) over
// the dot calendar for the same view.
function WeeksFace({
  shared,
  leftTogether,
  mine,
  faceLine,
  togetherRed,
  youRed,
  youCream,
}: {
  shared: number | null;
  leftTogether: number | null;
  mine: LifeWeeks | null;
  faceLine: string;
  togetherRed: number[];
  youRed: number[];
  youCream: number[];
}) {
  const [tab, setTab] = useState<"together" | "you">("together");

  const togetherView = shared !== null;

  const content =
    tab === "together" && togetherView ? (
      <>
        <div className="flex justify-center mt-2">
          <InteractiveRings
            soFar={{
              value: shared ?? 0,
              pct: (shared ?? 0) / TOTAL_WEEKS,
            }}
            left={{
              value: leftTogether ?? 0,
              pct: (leftTogether ?? 0) / TOTAL_WEEKS,
            }}
          />
        </div>
        <div className="mt-2.5">
          <DotCalendar
            red={togetherRed}
            segments={[
              { count: shared ?? 0, color: DOT.together },
              { count: leftTogether ?? 0, color: DOT.ahead },
              // Weeks of the 4,000 outside the shared horizon.
              {
                count: Math.max(
                  0,
                  TOTAL_WEEKS - (shared ?? 0) - (leftTogether ?? 0),
                ),
                color: DOT.before,
              },
            ]}
          />
        </div>
      </>
    ) : tab === "you" && mine ? (
      <>
        <div className="flex justify-center mt-2">
          <InteractiveRings
            soFar={{ value: mine.lived, pct: mine.lived / TOTAL_WEEKS }}
            left={{ value: mine.left, pct: mine.left / TOTAL_WEEKS }}
          />
        </div>
        <div className="mt-2.5">
          <DotCalendar
            red={youRed}
            cream={youCream}
            segments={[
              { count: mine.before, color: DOT.before },
              { count: mine.together, color: DOT.together },
              { count: mine.left, color: DOT.ahead },
            ]}
          />
        </div>
      </>
    ) : (
      <p className="mt-4 text-[11px] text-cream-mute leading-snug">
        {tab === "you"
          ? "Add your birthday on the Account page and your weeks appear here."
          : faceLine}
      </p>
    );

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1">{content}</div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {(
          [
            { key: "together", label: "Together" },
            { key: "you", label: "You" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full py-1 text-[10.5px] font-medium transition ${
              tab === key
                ? "bg-gold text-[#1a1a1a]"
                : "bg-card-2/70 border border-line-soft/60 text-cream-dim hover:border-gold/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WeeksDotsCard({
  sharedWeeks,
  togetherSince,
  me,
  partner,
}: {
  sharedWeeks: number | null;
  togetherSince: string | null;
  me: WeeksPerson;
  partner: WeeksPerson | null;
}) {
  const [open, setOpen] = useState(false);

  const shared = sharedWeeks;

  const mine = lifeWeeks(me, sharedWeeks);
  const theirs = partner ? lifeWeeks(partner, sharedWeeks) : null;
  const togetherAhead =
    mine && theirs ? Math.min(mine.left, theirs.left) : null;

  // Weeks left together, using the tightest KNOWN bound: the shared future
  // cannot exceed either partner's remaining weeks, so one known birthday
  // already caps it. Only with no birthdays at all does it fall back to
  // 4,000 minus the shared count.
  const knownLefts = [mine?.left, theirs?.left].filter(
    (n): n is number => n != null,
  );
  const leftTogether =
    knownLefts.length > 0
      ? Math.min(...knownLefts)
      : shared !== null
        ? TOTAL_WEEKS - shared
        : null;

  // Two origin marks only (Christian's call, 2026-08-13): red = the week
  // the two of you began, cream = the birth week. No recurring markers.
  const beganFor = (p: WeeksPerson): number[] =>
    p.birthday && togetherSince
      ? [weeksBetween(p.birthday, togetherSince)]
      : [];
  const birthDotFor = (p: WeeksPerson): number[] => (p.birthday ? [0] : []);

  // The shared timeline starts AT the beginning: its first dot is the day.
  const togetherRed = togetherSince && shared !== null ? [0] : [];
  const youRed = beganFor(me);
  const youCream = birthDotFor(me);

  const faceLine = (() => {
    if (leftTogether !== null && shared !== null)
      return `about ${leftTogether.toLocaleString()} weeks still ahead, together`;
    return "Add your together-since date to count them";
  })();

  return (
    <>
      <Card className="flex flex-col min-h-[230px] h-full">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-left w-full group"
          aria-label="About 4,000 Weeks"
        >
          <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
            4,000 Weeks
          </div>
          <div className="text-[13px] text-cream-dim mt-0.5 group-hover:text-gold transition">
            A life, in weeks · details
          </div>
        </button>

        <WeeksFace
          shared={shared}
          leftTogether={leftTogether}
          mine={mine}
          faceLine={faceLine}
          togetherRed={togetherRed}
          youRed={youRed}
          youCream={youCream}
        />
      </Card>

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
                <LifeGrid
                  weeks={mine}
                  red={beganFor(me)}
                  cream={birthDotFor(me)}
                />
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
                <LifeGrid
                  weeks={theirs}
                  red={beganFor(partner)}
                  cream={birthDotFor(partner)}
                />
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
