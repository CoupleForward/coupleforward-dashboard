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

            {/* Two columns as before (center apps left, daily rail right),
                with the right rail's tail wrapping underneath the middle
                apps as a full-width row instead of running the page long
                (Christian's layout call, 2026-08-13). */}
            <div className="grid gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-12">
              {/* Center column */}
              <div className="lg:col-span-8 space-y-5 lg:space-y-6">
                {/* Compact trio over the video window */}
                <div className="grid gap-4 lg:gap-5 grid-cols-1 sm:grid-cols-3 items-stretch">
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
                  <ConnectionScoreCard
                    score={connectionScore}
                    latest={latestByMember}
                    history={data.scoreDetail}
                  />
                  <JourneyCard />
                </div>

                {/* The video window, left side as before */}
                <LiveTeachingCard />

                {/* Four measurement squares */}
                <div className="grid gap-4 lg:gap-5 grid-cols-2 xl:grid-cols-4">
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
                  <SatisfactionCard detail={data.scoreDetail} />
                  <NinetyDayLoopCard />
                  <PulseCard
                    current={data.currentHuddle}
                    previous={data.previousHuddle}
                  />
                </div>
              </div>

              {/* Right rail: prompt on top, then the daily rhythm */}
              <div className="lg:col-span-4 space-y-5 lg:space-y-6">
                <WeeklyPromptCard />
                {daily && (
                  <DailyCheckinCard
                    coupleId={data.couple.id}
                    userId={data.userId}
                    today={daily.today}
                    partnerName={partnerName}
                    hasPartner={data.members.length > 1}
                    streaks={daily.streaks}
                  />
                )}
                {daily && daily.rows.length > 0 && (
                  <DailyTrendsCard
                    rows={daily.rows}
                    streaks={daily.streaks}
                    hasPartner={data.members.length > 1}
                  />
                )}
                <UpcomingCard plan={data.currentHuddle?.plan ?? null} />
                <JournalCard
                  coupleId={data.couple.id}
                  initialEntries={data.journalEntries}
                />
                <SomaticToolsCard />
              </div>
            </div>

            {/* LAYOUT RULE (Christian, 2026-08-13): the two columns above
                are the dashboard. Any NEW dashboard feature from here on
                goes in this full-width section underneath all columns,
                wrapping as a grid — never appended to either column. */}
          </main>
        </div>
      </div>

      <MobileNav active="home" />
    </div>
  );
}
