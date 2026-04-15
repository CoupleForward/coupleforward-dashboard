import { Card, CardLabel } from "../Card";
import { ChevronRightIcon } from "../icons";

export function WeeklyPromptCard() {
  return (
    <Card className="bg-gradient-to-br from-[#332515] via-[#2a2014] to-[#241a10] border-gold/30">
      <CardLabel>This week&apos;s prompt</CardLabel>
      <p className="mt-3 text-[15px] leading-snug text-cream font-medium">
        What is one thing your partner did this week that you noticed but
        didn&apos;t say out loud?
      </p>
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-gold hover:text-gold-bright transition"
      >
        Reflect Together
        <ChevronRightIcon className="size-3.5" />
      </button>
    </Card>
  );
}
