export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type TimeSlot = { day: DayOfWeek; time: string };

export const DAY_ORDER: DayOfWeek[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const DAY_LONG: Record<DayOfWeek, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

// JS Date.getDay(): Sun=0, Mon=1, ..., Sat=6
const DAY_INDEX: Record<DayOfWeek, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export function sortSlots(slots: TimeSlot[]): TimeSlot[] {
  return [...slots].sort((a, b) => {
    const d = DAY_INDEX[a.day] - DAY_INDEX[b.day];
    if (d !== 0) return d;
    return a.time.localeCompare(b.time);
  });
}

export function nextOccurrence(
  day: DayOfWeek,
  time: string,
  from: Date = new Date(),
): Date {
  const [h, m] = time.split(":").map((s) => parseInt(s, 10));
  const target = new Date(from);
  const currentDay = from.getDay();
  const targetDay = DAY_INDEX[day];
  let delta = targetDay - currentDay;
  if (delta < 0) delta += 7;
  target.setDate(from.getDate() + delta);
  target.setHours(h || 19, m || 0, 0, 0);
  // If it's today but already past, push to next week
  if (delta === 0 && target.getTime() <= from.getTime()) {
    target.setDate(target.getDate() + 7);
  }
  return target;
}

export function formatTimeDisplay(time: string): string {
  if (!time || !time.includes(":")) return time;
  const [h, m] = time.split(":").map((s) => parseInt(s, 10));
  if (isNaN(h) || isNaN(m)) return time;
  const period = h >= 12 ? "pm" : "am";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, "0");
  return `${displayH}:${mm} ${period}`;
}

function icsEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function icsDate(d: Date): string {
  // Returns YYYYMMDDTHHMMSSZ (UTC basic format)
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function buildIcs({
  title,
  description,
  slots,
  durationMinutes = 60,
}: {
  title: string;
  description: string;
  slots: TimeSlot[];
  durationMinutes?: number;
}): string {
  const now = new Date();
  const dtstamp = icsDate(now);
  const events = slots
    .map((slot, idx) => {
      const start = nextOccurrence(slot.day, slot.time, now);
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
      const uid = `${dtstamp}-${idx}-${slot.day}-${slot.time}@coupleforward`;
      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${icsDate(start)}`,
        `DTEND:${icsDate(end)}`,
        `SUMMARY:${icsEscape(title)}`,
        `DESCRIPTION:${icsEscape(description)}`,
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Couple Forward//Huddle//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(filename: string, ics: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safe = filename.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
  a.download = `${safe}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type PlanKey =
  | "morning"
  | "evening"
  | "convos"
  | "dinners"
  | "adventure"
  | "familyFriends"
  | "personal";

export type PlanItem = {
  committed: boolean;
  details: string;
  slots?: TimeSlot[];
  menuIdeas?: string;
};

export type PlanState = Record<PlanKey, PlanItem>;

export const RITUAL_CALENDAR_TITLES: Record<PlanKey, string> = {
  morning: "Morning Ritual",
  evening: "Evening Ritual",
  convos: "Intentional Conversation",
  dinners: "Intentional Family Dinner",
  adventure: "Couple Forward Adventure",
  familyFriends: "Family / Friend Connection",
  personal: "Personal Growth Time",
};

export const STORAGE_KEY = "cf-huddle-plan-v1";

export function loadPlan(): PlanState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlanState;
  } catch {
    return null;
  }
}

export function savePlan(plan: PlanState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    /* quota exceeded or disabled */
  }
}

export type UpcomingEvent = {
  key: string;
  ritualKey: PlanKey;
  title: string;
  date: Date;
  details: string;
};

export function getUpcomingEvents(
  plan: PlanState,
  from: Date = new Date(),
): UpcomingEvent[] {
  const events: UpcomingEvent[] = [];
  for (const key of Object.keys(plan) as PlanKey[]) {
    const item = plan[key];
    if (!item.committed || !item.slots) continue;
    for (const slot of item.slots) {
      const date = nextOccurrence(slot.day, slot.time, from);
      events.push({
        key: `${key}-${slot.day}-${slot.time}`,
        ritualKey: key,
        title: RITUAL_CALENDAR_TITLES[key],
        date,
        details: item.details || "",
      });
    }
  }
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
