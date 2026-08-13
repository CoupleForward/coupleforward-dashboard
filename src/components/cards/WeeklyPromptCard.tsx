import { Card, CardLabel } from "../Card";
import { ChevronRightIcon } from "../icons";
import { promptForThisWeek } from "@/lib/lab/prompts";

// One prompt per week, rotating deterministically by week key so both
// partners always see the same one — shared with the journal's write
// flow via lib/lab/prompts. Answering happens in the shared journal,
// one scroll away.

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
