import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Sidebar } from "@/components/Sidebar";
import { ConnectionScoreCard } from "@/components/cards/ConnectionScoreCard";
import { HuddleStreakCard } from "@/components/cards/HuddleStreakCard";
import { JournalCard } from "@/components/cards/JournalCard";
import { LiveTeachingCard } from "@/components/cards/LiveTeachingCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { NinetyDayLoopCard } from "@/components/cards/NinetyDayLoopCard";
import { PulseCard } from "@/components/cards/PulseCard";
import { SatisfactionCard } from "@/components/cards/SatisfactionCard";
import { SomaticToolsCard } from "@/components/cards/SomaticToolsCard";
import { SubstackCard } from "@/components/cards/SubstackCard";
import { UpcomingCard } from "@/components/cards/UpcomingCard";
import { WeeklyPromptCard } from "@/components/cards/WeeklyPromptCard";
import { WeeksDotsCard } from "@/components/cards/WeeksDotsCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-cream">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 lg:py-6 pb-24 lg:pb-8">
            <div className="grid gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-12">
              {/* Center column */}
              <div className="lg:col-span-8 space-y-5 lg:space-y-6">
                <div className="grid gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 items-start">
                  <HuddleStreakCard />
                  <ConnectionScoreCard />
                </div>

                {/* Prominent widescreen live teaching */}
                <LiveTeachingCard />

                {/* Four measurement squares */}
                <div className="grid gap-4 lg:gap-5 grid-cols-2 lg:grid-cols-4">
                  <WeeksDotsCard />
                  <SatisfactionCard />
                  <NinetyDayLoopCard />
                  <PulseCard />
                </div>
              </div>

              {/* Right column */}
              <div className="lg:col-span-4 space-y-5 lg:space-y-6">
                <UpcomingCard />
                <WeeklyPromptCard />
                <JournalCard />
                <SomaticToolsCard />
                <SubstackCard />
                <NewsCard />
              </div>
            </div>
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
