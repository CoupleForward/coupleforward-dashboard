import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ChevronRightIcon, FlameIcon } from "@/components/icons";
import { coupleDisplayName, getLabContext } from "@/lib/lab/data";
import { formatWeekLabel, getCompletedHuddles } from "@/lib/lab/history";
import type { PlanState } from "@/lib/huddle";

export const dynamic = "force-dynamic";

function committedCount(plan: Partial<PlanState> | null): number {
  if (!plan) return 0;
  return Object.values(plan).filter((item) => item?.committed).length;
}

// Every completed week persists — this is the browser for them.
export default async function HistoryPage() {
  const ctx = await getLabContext();
  if (ctx.state === "signed_out") redirect("/login");
  if (ctx.state === "no_couple") redirect("/welcome");

  const weeks = await getCompletedHuddles(ctx.couple.id);
  const nameFor = (userId: string | null): string => {
    const m = ctx.members.find((x) => x.user_id === userId);
    return (m?.display_name ?? "").split(" ")[0] || "Partner";
  };

  return (
    <div className="min-h-screen bg-bg text-cream">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px]">

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            coupleName={coupleDisplayName(ctx)}
            togetherSince={ctx.couple.together_since}
            memberSince={ctx.couple.created_at}
            soloPartner={ctx.members.length < 2}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
            <div className="max-w-[720px]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h1 className="text-[22px] font-semibold text-cream">
                    Past weeks
                  </h1>
                  <p className="mt-1 text-[13px] text-cream-dim">
                    Your completed Huddles, kept. Open a week to reread what
                    you both wrote.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[12px] text-cream-dim shrink-0">
                  <FlameIcon className="size-4 text-gold" />
                  <span>
                    Longest streak:{" "}
                    <span className="text-cream tabular-nums">
                      {ctx.couple.longest_streak}
                    </span>{" "}
                    {ctx.couple.longest_streak === 1 ? "week" : "weeks"}
                  </span>
                </div>
              </div>

              {weeks.length === 0 ? (
                <Card className="mt-6">
                  <p className="text-[13px] text-cream-dim leading-relaxed">
                    No completed Huddles yet. Your first one will land here:
                    the reflections, the asks, and the plan, kept for both of
                    you.
                  </p>
                  <Link
                    href="/huddle"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold text-[#1a1a1a] px-4 py-2 text-[12px] font-semibold hover:bg-gold-bright transition"
                  >
                    Start this week&apos;s Huddle
                    <ChevronRightIcon className="size-3" />
                  </Link>
                </Card>
              ) : (
                <div className="mt-6 space-y-3">
                  {weeks.map(({ huddle, scores }) => (
                    <Link
                      key={huddle.id}
                      href={`/history/${huddle.week_start}`}
                      className="block"
                    >
                      <Card className="flex items-center gap-4 hover:border-gold/40 transition">
                        <div className="min-w-0 flex-1">
                          <div className="text-[14.5px] font-medium text-cream">
                            Week of {formatWeekLabel(huddle.week_start)}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-cream-mute">
                            <span>
                              {huddle.hug_count} six-second{" "}
                              {huddle.hug_count === 1 ? "hug" : "hugs"}
                            </span>
                            <span>
                              {committedCount(huddle.plan)}{" "}
                              {committedCount(huddle.plan) === 1
                                ? "ritual"
                                : "rituals"}{" "}
                              committed
                            </span>
                            {scores.map((s) => (
                              <span key={s.id}>
                                {nameFor(s.user_id)}:{" "}
                                <span className="text-cream-dim tabular-nums">
                                  {s.score}/10
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRightIcon className="size-4 text-cream-mute shrink-0" />
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
