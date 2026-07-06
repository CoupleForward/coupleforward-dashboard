"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "../Card";
import { CalendarIcon, ChevronRightIcon } from "../icons";
import {
  type PlanState,
  type UpcomingEvent,
  formatTimeDisplay,
  getUpcomingEvents,
} from "@/lib/huddle";

const MAX_EVENTS = 4;

// plan now comes from this week's huddle row in Supabase (passed by the
// server component) instead of localStorage.
export function UpcomingCard({ plan }: { plan: Partial<PlanState> | null }) {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

  // Dates are computed client-side so "next occurrence" uses the viewer's
  // clock and timezone.
  useEffect(() => {
    if (plan) setEvents(getUpcomingEvents(plan as PlanState));
  }, [plan]);

  const shown = events.slice(0, MAX_EVENTS);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-gold-soft grid place-items-center text-gold shrink-0">
          <CalendarIcon className="size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="text-[11.5px] text-cream-dim">This week</div>
          <div className="text-[17px] font-semibold text-cream leading-tight mt-0.5">
            From your Huddle
          </div>
          <div className="text-[9px] tracking-[0.18em] uppercase text-cream-mute mt-1">
            Upcoming rituals
          </div>
        </div>
      </div>

      {shown.length > 0 ? (
        <ul className="flex flex-col gap-2 mt-1">
          {shown.map((ev) => {
            const weekday = ev.date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const day = ev.date.getDate();
            const month = ev.date.toLocaleDateString("en-US", {
              month: "short",
            });
            const hh = ev.date.getHours().toString().padStart(2, "0");
            const mm = ev.date.getMinutes().toString().padStart(2, "0");
            const time = formatTimeDisplay(`${hh}:${mm}`);
            return (
              <li
                key={ev.key}
                className="flex items-center gap-3 rounded-xl bg-card-2/60 border border-line-soft/60 px-3 py-2"
              >
                <div className="flex flex-col items-center justify-center w-10 shrink-0">
                  <div className="text-[8.5px] tracking-[0.12em] uppercase text-cream-mute">
                    {month}
                  </div>
                  <div className="text-[16px] font-semibold text-cream tabular-nums leading-none">
                    {day}
                  </div>
                  <div className="text-[8.5px] tracking-[0.12em] uppercase text-gold mt-0.5">
                    {weekday}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium text-cream truncate">
                    {ev.title}
                  </div>
                  <div className="text-[10.5px] text-cream-mute">{time}</div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[12px] text-cream-mute leading-snug mt-1">
          No scheduled rituals yet. Start a Huddle to plan your week.
        </p>
      )}

      <Link
        href="/huddle"
        className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-card-2/80 border border-line-soft/60 text-cream px-3.5 py-2 text-[12px] font-medium hover:border-gold/60 hover:text-gold transition"
      >
        {events.length > 0 ? "Update this week" : "Start your first Huddle"}
        <ChevronRightIcon className="size-3" />
      </Link>
    </Card>
  );
}
