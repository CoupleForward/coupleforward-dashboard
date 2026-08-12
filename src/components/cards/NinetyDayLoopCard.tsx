"use client";

import { useState } from "react";
import { Card } from "../Card";
import { DetailSheet, DepthSection } from "../DetailSheet";

const categories = [
  "Holidays",
  "Special Occasions",
  "Experiences & Travel",
  "Couple Goals",
  "Personal Goals",
];

// Concentric arc rings — decorative, evokes the printed 90 Day Loop protocol.
const rings = [
  { r: 46, dash: 72, opacity: 0.95 },
  { r: 38, dash: 68, opacity: 0.82 },
  { r: 30, dash: 62, opacity: 0.68 },
  { r: 22, dash: 54, opacity: 0.55 },
  { r: 14, dash: 44, opacity: 0.42 },
];

export function NinetyDayLoopCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left w-full h-full"
        aria-label="About the 90 Day Loop"
      >
        <Card className="flex flex-col min-h-[230px] h-full relative overflow-hidden hover:border-gold/40 transition cursor-pointer">
          {/* Decorative concentric arcs */}
          <div className="absolute -right-10 -top-8 pointer-events-none">
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              {rings.map((ring) => (
                <circle
                  key={ring.r}
                  cx="50"
                  cy="50"
                  r={ring.r}
                  fill="none"
                  stroke="#c8963e"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${ring.dash} 100`}
                  strokeDashoffset="18"
                  opacity={ring.opacity}
                  transform="rotate(-95 50 50)"
                />
              ))}
            </svg>
          </div>

          <div className="relative flex flex-col h-full">
            <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
              The
            </div>
            <div className="text-[22px] font-semibold text-cream leading-tight mt-0.5">
              90 Day Loop
            </div>
            <div className="text-[9px] tracking-[0.22em] uppercase text-gold mt-0.5">
              protocol
            </div>

            <ul className="mt-auto space-y-1 text-[10.5px] text-cream-dim">
              {categories.map((c) => (
                <li key={c} className="flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-gold shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </button>

      <DetailSheet
        open={open}
        onClose={() => setOpen(false)}
        label="The protocol"
        title="The 90 Day Loop"
      >
        <DepthSection heading="What this is">
          A planning rhythm for the life around your weeks. Every ninety
          days, you sit down together and author the next season on purpose,
          across five categories, instead of letting the calendar happen to
          you.
        </DepthSection>

        <DepthSection heading="The five categories">
          <ul className="space-y-2">
            <li>
              <span className="text-cream">Holidays.</span> Decide how you
              want them to feel before the season decides for you.
            </li>
            <li>
              <span className="text-cream">Special occasions.</span>{" "}
              Birthdays, anniversaries, the dates that matter to you two.
            </li>
            <li>
              <span className="text-cream">Experiences and travel.</span>{" "}
              What you will actually go do together this season.
            </li>
            <li>
              <span className="text-cream">Couple goals.</span> One or two,
              chosen together, small enough to finish.
            </li>
            <li>
              <span className="text-cream">Personal goals.</span> Autonomy
              gets planned for too. You each name your own.
            </li>
          </ul>
        </DepthSection>

        <DepthSection heading="How it meets your week">
          The Loop sets the season; the Huddle runs the week inside it. What
          you commit to here shows up as the rituals and adventures you plan
          each week. Today the Loop lives as the printed protocol from your
          program materials. A guided in-Lab version is planned, and this
          card will open it when it is real.
        </DepthSection>
      </DetailSheet>
    </>
  );
}
