import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ConnectionScoreCard } from "@/components/cards/ConnectionScoreCard";
import { DailyCheckinCard } from "@/components/cards/DailyCheckinCard";
import { DailyTrendsCard } from "@/components/cards/DailyTrendsCard";
import { HuddleStreakCard } from "@/components/cards/HuddleStreakCard";
import { JournalCard } from "@/components/cards/JournalCard";
import { JourneyCard } from "@/components/cards/JourneyCard";
import { LiveTeachingCard } from "@/components/cards/LiveTeachingCard";
import { NinetyDayLoopCard } from "@/components/cards/NinetyDayLoopCard";
import { PulseCard } from "@/components/cards/PulseCard";
import { SatisfactionCard } from "@/components/cards/SatisfactionCard";
import { SomaticToolsCard } from "@/components/cards/SomaticToolsCard";
import { UpcomingCard } from "@/components/cards/UpcomingCard";
import { WeeklyPromptCard } from "@/components/cards/WeeklyPromptCard";
import { WeeksDotsCard } from "@/components/cards/WeeksDotsCard";
import { getDailyData } from "@/lib/lab/checkins";
import { coupleDisplayName, getDashboardData, getLabContext } from "@/lib/lab/data";
import { weekStart } from "@/lib/lab/week";

export const dynamic = "force-dynamic";

export default async function Home() {
  const ctx = await getLabContext();
  if (ctx.state === "signed_out") redirect("/login");
  if (ctx.state === "no_couple") redirect("/welcome");

  const data = await getDashboardData(ctx);
  const thisWeek = weekStart();
  // Null until migration 20260812150000 is applied; the daily surfaces
  // stay dark until then, no code change needed.
  const daily = await getDailyData();
  const partner = data.members.find((m) => m.user_id !== data.userId);
  const partnerName = partner
    ? (partner.display_name ?? "").split(" ")[0] || "Partner"
    : null;

  const connectionScore =
    data.latestScores.length > 0
      ? Math.round(
          (data.latestScores.reduce((a, s) => a + s.score, 0) /
            data.latestScores.length) *
            10,
        )
      : null;
  const firstName = (userId: string): string => {
    const m = data.members.find((x) => x.user_id === userId);
    return (m?.display_name ?? "").split(" ")[0] || "Partner";
  };
  const latestByMember = data.latestScores.map((s) => ({
    name: firstName(s.user_id),
    score: s.score,
  }));
  // A one-member couple is only "waiting for a partner" if it isn't a
  // deliberate solo journey. Solo members get no partner nag.
  const soloPartner = data.members.length < 2 && !data.couple.is_solo;

  return (
    <div className="min-h-screen bg-bg text-cream">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px]">

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            coupleName={coupleDisplayName(data)}
            togetherSince={data.couple.together_since}
            memberSince={data.couple.created_at}
            soloPartner={soloPartner}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 lg:py-6 pb-24 lg:pb-8">
            {soloPartner && (
              <div className="mb-5 rounded-xl bg-gold-soft/30 border border-gold/30 px-4 py-3 text-[12.5px] text-cream-dim">
                {data.pendingInvite ? (
                  <>
                    Waiting for{" "}
                    <span className="text-gold">
                      {data.pendingInvite.invited_name ??
                        data.pendingInvite.invited_email}
                    </span>{" "}
                    to join. They&apos;ll see the invite when they sign in with
                    that email.
                  </>
                ) : (
                  <>
                    Your partner hasn&apos;t joined yet.{" "}
                    <a href="/welcome" className="text-gold hover:underline">
                      Invite them →
                    </a>
                  </>
                )}
              </div>
            )}

            {/* Tile flow: cards wrap into as many columns as the width
                allows, keeping the dashboard square-ish on desktop
                (Christian's layout call, 2026-08-13). Column flow is
                top-to-bottom, left-to-right. */}
            <div className="columns-1 sm:columns-2 xl:columns-3 2xl:columns-4 gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid">
              <div>
                <HuddleStreakCard
                  streak={data.couple.current_streak}
                  longest={data.couple.longest_streak}
                  completedWeeks={data.recentCompletedWeeks}
                  completedCount={data.completedCount}
                  huddleDoneThisWeek={
                    data.currentHuddle?.status === "completed" &&
                    data.currentHuddle.week_start === thisWeek
                  }
                />
              </div>
              {daily && (
                <div>
                  <DailyCheckinCard
                    coupleId={data.couple.id}
                    userId={data.userId}
                    today={daily.today}
                    partnerName={partnerName}
                    hasPartner={data.members.length > 1}
                    streaks={daily.streaks}
                  />
                </div>
              )}
              <div>
                <ConnectionScoreCard
                  score={connectionScore}
                  latest={latestByMember}
                  history={data.scoreDetail}
                />
              </div>
              {daily && daily.rows.length > 0 && (
                <div>
                  <DailyTrendsCard
                    rows={daily.rows}
                    streaks={daily.streaks}
                    hasPartner={data.members.length > 1}
                  />
                </div>
              )}
              <div>
                <UpcomingCard plan={data.currentHuddle?.plan ?? null} />
              </div>
              <div>
                <WeeksDotsCard
                  sharedWeeks={data.sharedWeeks}
                  togetherSince={data.couple.together_since}
                  me={{
                    name: "You",
                    birthday:
                      data.members.find((m) => m.user_id === data.userId)
                        ?.birthday ?? null,
                  }}
                  partner={
                    partner
                      ? {
                          name: partnerName ?? "Partner",
                          birthday: partner.birthday ?? null,
                        }
                      : null
                  }
                />
              </div>
              <div>
                <JourneyCard />
              </div>
              <div>
                <SatisfactionCard detail={data.scoreDetail} />
              </div>
              <div>
                <WeeklyPromptCard />
              </div>
              <div>
                <PulseCard
                  current={data.currentHuddle}
                  previous={data.previousHuddle}
                />
              </div>
              <div>
                <JournalCard
                  coupleId={data.couple.id}
                  initialEntries={data.journalEntries}
                />
              </div>
              <div>
                <NinetyDayLoopCard />
              </div>
              <div>
                <LiveTeachingCard />
              </div>
              <div>
                <SomaticToolsCard />
              </div>
            </div>
          </main>
        </div>
      </div>

      <MobileNav active="home" />
    </div>
  );
}
