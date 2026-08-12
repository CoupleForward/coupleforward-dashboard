import { Card, CardLabel } from "../Card";
import { ChevronRightIcon } from "../icons";
import { weekStart } from "@/lib/lab/week";

// One prompt per week, rotating deterministically by week key so both
// partners always see the same one. Answering happens in the shared
// journal, one scroll away.
const PROMPTS = [
  "What is one thing your partner did this week that you noticed but didn't say out loud?",
  "When did you feel closest to each other this week? What was happening right before?",
  "What is something you almost brought up this week and didn't? What stopped you?",
  "Where did you catch yourself reacting on autopilot this week?",
  "What is one small moment from this week you want to remember in a year?",
  "What did your partner carry this week that you only noticed later?",
  "When did you feel most yourself with your partner this week?",
  "What repair happened this week, even a small one? Who moved first?",
];

function promptForThisWeek(): string {
  // Stable hash of the Monday key → index. Same for both partners all week.
  const key = weekStart();
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PROMPTS[h % PROMPTS.length];
}

export function WeeklyPromptCard() {
  return (
    <Card className="bg-gradient-to-br from-[#332515] via-[#2a2014] to-[#241a10] border-gold/30">
      <CardLabel>This week&apos;s prompt</CardLabel>
      <p className="mt-3 text-[15px] leading-snug text-cream font-medium">
        {promptForThisWeek()}
      </p>
      <a
        href="#journal"
        className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-gold hover:text-gold-bright transition"
      >
        Write about it in your journal
        <ChevronRightIcon className="size-3.5" />
      </a>
    </Card>
  );
}
