import { weekStart } from "./week";

// The Couple Forward weekly prompts. One per week, rotating
// deterministically by week key so both partners always see the same one
// (on the dashboard card and inside the journal write flow).
export const WEEKLY_PROMPTS = [
  "What is one thing your partner did this week that you noticed but didn't say out loud?",
  "When did you feel closest to each other this week? What was happening right before?",
  "What is something you almost brought up this week and didn't? What stopped you?",
  "Where did you catch yourself reacting on autopilot this week?",
  "What is one small moment from this week you want to remember in a year?",
  "What did your partner carry this week that you only noticed later?",
  "When did you feel most yourself with your partner this week?",
  "What repair happened this week, even a small one? Who moved first?",
];

// Stable string hash → index. Same input, same prompt, everywhere.
export function hashPick(key: string, length: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % length;
}

export function promptForThisWeek(): string {
  return WEEKLY_PROMPTS[hashPick(weekStart(), WEEKLY_PROMPTS.length)];
}
