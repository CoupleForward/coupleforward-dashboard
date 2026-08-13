"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";
import { ChevronRightIcon, FlameIcon } from "../icons";

const TOTAL_DOTS = 16;

// The streak is rhythm, not progress (docs/plan/01 §5): it shows you kept
// the ritual, never that the relationship "improved". The depth view says
// exactly that.
export function HuddleStreakCard({
  streak,
  longest,
  huddleDoneThisWeek,
  completedWeeks,
  completedCount,
}: {
  streak: number;
  longest: number;
  huddleDoneThisWeek: boolean;
  completedWeeks: string[];
  completedCount: number;
}) {
  const [open, setOpen] = useState(false);

  const fmtWeek = (w: string) =>
    new Date(`${w}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <>
      <Card className="flex flex-col gap-2.5 h-full">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-left flex items-start gap-2.5 group"
          aria-label="About your Huddle streak"
        >
          <div className="size-8 rounded-lg bg-gold-soft grid place-items-center text-gold shrink-0">
            <FlameIcon className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="text-[11px] text-cream-dim group-hover:text-cream transition">
              Huddle Streak
            </div>
            <div className="text-[22px] leading-none font-semibold text-cream mt-0.5">
              {streak}{" "}
              <span className="text-cream-dim text-[13px] font-normal">
                {streak === 1 ? "week" : "weeks"}
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 flex-wrap">
          {Array.from({ length: TOTAL_DOTS }).map((_, i) => {
            const inStreak = i < Math.min(streak, TOTAL_DOTS);
            return (
              <span
                key={i}
                className={`size-[5px] rounded-full ${
                  inStreak ? "bg-gold" : "bg-line"
                }`}
              />
            );
          })}
        </div>

        <Link
          href="/huddle"
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-gold text-[#1a1a1a] px-3 py-1.5 text-[11.5px] font-semibold hover:bg-gold-bright transition"
        >
          {huddleDoneThisWeek
            ? "Review this week"
            : streak === 0
              ? "Start your first Huddle"
              : "Start this week"}
          <ChevronRightIcon className="size-3" />
        </Link>
      </Card>

      <DetailSheet
        open={open}
        onClose={() => setOpen(false)}
        label="Your rhythm"
        title="Huddle Streak"
      >
        <DepthSection heading="What this is">
          Consecutive weeks with a completed Huddle. A missed week resets
          the count, and resets nothing else. The streak measures the
          ritual, not the relationship: keeping it is how change gets a
          chance to happen, but the streak itself is rhythm, never progress.
        </DepthSection>

        <DepthSection heading="The record">
          <div className="space-y-1.5">
            <div className="flex justify-between gap-4">
              <span>Current streak</span>
              <span className="text-cream tabular-nums">
                {streak} {streak === 1 ? "week" : "weeks"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Longest streak</span>
              <span className="text-cream tabular-nums">
                {longest} {longest === 1 ? "week" : "weeks"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Total completed Huddles</span>
              <span className="text-cream tabular-nums">
                {completedCount}
              </span>
            </div>
          </div>
        </DepthSection>

        {completedWeeks.length > 0 && (
          <DepthSection heading="Recent completed weeks">
            <div className="space-y-1">
              {completedWeeks.slice(0, 12).map((w) => (
                <Link
                  key={w}
                  href={`/history/${w}`}
                  className="flex items-center justify-between gap-3 text-cream-dim hover:text-gold transition"
                >
                  <span>Week of {fmtWeek(w)}</span>
                  <ChevronRightIcon className="size-3" />
                </Link>
              ))}
            </div>
            <Link
              href="/history"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-gold hover:text-gold-bright transition"
            >
              All past weeks
              <ChevronRightIcon className="size-3" />
            </Link>
          </DepthSection>
        )}
      </DetailSheet>
    </>
  );
}
