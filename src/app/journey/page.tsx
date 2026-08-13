import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ArrowLeftIcon, ChevronRightIcon, ExternalIcon } from "@/components/icons";
import { coupleDisplayName, getLabContext } from "@/lib/lab/data";

export const dynamic = "force-dynamic";

// The invitation surface. Honest by design: the full node journey is not
// built yet, so this page never pretends it is. What IS real today: the
// Inner Compass (the first step) and the weekly Huddle underneath it all.
// When Christian's node map lands, this page becomes the map.

const PHASES = [
  {
    name: "Map It",
    line: "See the loop you are actually in, not the one you argue about. Where you are, named precisely, without blame.",
  },
  {
    name: "Rewire It",
    line: "Learn to catch the pattern while you are standing in it, settle the body that braces, and have the conversation that used to go sideways.",
  },
  {
    name: "Lock It In",
    line: "Repair becomes normal. Wanting replaces performing. You author what comes next on purpose.",
  },
];

export default async function JourneyPage() {
  const ctx = await getLabContext();
  if (ctx.state === "signed_out") redirect("/login");
  if (ctx.state === "no_couple") redirect("/welcome");

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
            <div className="max-w-[640px]">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[12px] text-cream-dim hover:text-cream transition"
              >
                <ArrowLeftIcon className="size-3.5" />
                Dashboard
              </Link>

              <div className="mt-4 text-[10px] font-semibold tracking-[0.24em] uppercase text-gold">
                The REWIRE Journey
              </div>
              <h1 className="mt-2 text-[26px] sm:text-[30px] font-semibold text-cream leading-tight">
                From where you are to where you want to be.
              </h1>
              <p className="mt-3 text-[14px] text-cream-dim leading-relaxed">
                Everyone can name their pattern now. Almost no one can exit
                it. The journey is a sequence, not more insight: a path of
                real destinations, each one a new capacity you didn&apos;t
                have before. Your Huddle keeps running underneath the whole
                way.
              </p>

              <div className="mt-7 space-y-3">
                {PHASES.map((phase, i) => (
                  <Card key={phase.name} className="flex gap-4">
                    <div className="size-8 rounded-full bg-gold-soft grid place-items-center text-gold text-[13px] font-semibold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold text-cream">
                        {phase.name}
                      </div>
                      <p className="mt-1 text-[13px] text-cream-dim leading-relaxed">
                        {phase.line}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="mt-6 border-gold/30 bg-gradient-to-br from-[#332515] via-[#2a2014] to-[#241a10]">
                <div className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
                  Where it stands
                </div>
                <p className="mt-2 text-[13.5px] text-cream-dim leading-relaxed">
                  The full journey is being built into the Lab now, and it
                  will measure what actually changes for you: not what you
                  completed. The first step is real today. The Inner Compass
                  Assessment maps where each of you actually is, and it is
                  where the path begins. You can take it now, alone or
                  together.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href="https://coupleforward.com/inner-compass"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gold text-[#1a1a1a] px-4 py-2 text-[12.5px] font-semibold hover:bg-gold-bright transition"
                  >
                    Take the Inner Compass
                    <ExternalIcon className="size-3" />
                  </a>
                  <Link
                    href="/huddle"
                    className="inline-flex items-center gap-1 text-[12.5px] font-medium text-gold hover:text-gold-bright transition"
                  >
                    Or just do this week&apos;s Huddle
                    <ChevronRightIcon className="size-3.5" />
                  </Link>
                </div>
              </Card>

              <p className="mt-5 text-[11.5px] text-cream-mute leading-relaxed">
                No pressure lives on this page. The rhythm you already have,
                the Huddle, the tools, your tracking: that is a complete
                membership on its own. The journey is here when you want it.
              </p>
            </div>
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
