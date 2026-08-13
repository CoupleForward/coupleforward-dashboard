import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardLabel } from "@/components/Card";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ArrowLeftIcon } from "@/components/icons";
import { coupleDisplayName, getLabContext } from "@/lib/lab/data";
import { formatWeekLabel, getHuddleByWeek } from "@/lib/lab/history";
import { ASK_QUESTIONS, REFLECT_QUESTIONS } from "@/lib/lab/questions";
import { RITUAL_CALENDAR_TITLES, type PlanKey, type PlanState } from "@/lib/huddle";
import type { HuddleAnswer } from "@/lib/lab/types";

export const dynamic = "force-dynamic";

function AnswerBlock({
  label,
  answersByMember,
}: {
  label: string;
  answersByMember: { name: string; text: string | null }[];
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0 border-b border-line-soft/60 last:border-b-0">
      <div className="text-[13px] font-medium text-cream leading-snug">
        {label}
      </div>
      <div className="mt-2.5 space-y-2.5">
        {answersByMember.map(({ name, text }, i) => (
          <div key={i}>
            <div className="text-[10px] tracking-[0.14em] uppercase text-gold">
              {name}
            </div>
            {text ? (
              <p className="mt-0.5 text-[13px] text-cream-dim leading-relaxed whitespace-pre-wrap">
                {text}
              </p>
            ) : (
              <p className="mt-0.5 text-[12px] text-cream-mute italic">
                No answer saved.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HistoryWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  const ctx = await getLabContext();
  if (ctx.state === "signed_out") redirect("/login");
  if (ctx.state === "no_couple") redirect("/welcome");

  const detail = await getHuddleByWeek(ctx.couple.id, week);
  if (!detail) notFound();

  const nameFor = (userId: string | null): string => {
    const m = ctx.members.find((x) => x.user_id === userId);
    return (m?.display_name ?? "").split(" ")[0] || "Partner";
  };

  const answerFor = (
    stage: HuddleAnswer["stage"],
    key: string,
    userId: string,
  ): string | null =>
    detail.answers.find(
      (a) =>
        a.stage === stage &&
        a.question_key === key &&
        a.member_user_id === userId,
    )?.answer_text ?? null;

  const plan = (detail.huddle.plan ?? {}) as Partial<PlanState>;
  const committed = (Object.keys(RITUAL_CALENDAR_TITLES) as PlanKey[]).filter(
    (k) => plan[k]?.committed,
  );

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
              <Link
                href="/history"
                className="inline-flex items-center gap-1.5 text-[12px] text-cream-dim hover:text-cream transition"
              >
                <ArrowLeftIcon className="size-3.5" />
                All past weeks
              </Link>

              <h1 className="mt-3 text-[22px] font-semibold text-cream">
                Week of {formatWeekLabel(detail.huddle.week_start)}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-cream-mute">
                <span>
                  {detail.huddle.hug_count} six-second{" "}
                  {detail.huddle.hug_count === 1 ? "hug" : "hugs"}
                </span>
                {detail.scores.map((s) => (
                  <span key={s.id}>
                    {nameFor(s.user_id)} closeness:{" "}
                    <span className="text-cream-dim tabular-nums">
                      {s.score}/10
                    </span>
                  </span>
                ))}
                {detail.huddle.status !== "completed" && (
                  <span className="text-gold">In progress</span>
                )}
              </div>

              <Card className="mt-6">
                <CardLabel>Reflect: looking back</CardLabel>
                <div className="mt-3">
                  {REFLECT_QUESTIONS.map((q) => (
                    <AnswerBlock
                      key={q.key}
                      label={q.label}
                      answersByMember={ctx.members.map((m) => ({
                        name: nameFor(m.user_id),
                        text: answerFor("reflect", q.key, m.user_id),
                      }))}
                    />
                  ))}
                </div>
              </Card>

              <Card className="mt-4">
                <CardLabel>Ask: looking forward</CardLabel>
                <div className="mt-3">
                  {ASK_QUESTIONS.map((q) => (
                    <AnswerBlock
                      key={q.key}
                      label={q.label}
                      answersByMember={ctx.members.map((m) => ({
                        name: nameFor(m.user_id),
                        text: answerFor("ask", q.key, m.user_id),
                      }))}
                    />
                  ))}
                </div>
              </Card>

              <Card className="mt-4">
                <CardLabel>The plan that week</CardLabel>
                {committed.length === 0 ? (
                  <p className="mt-3 text-[13px] text-cream-mute">
                    No rituals were committed this week.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {committed.map((k) => {
                      const item = plan[k]!;
                      return (
                        <li key={k} className="text-[13px] text-cream-dim">
                          <span className="text-cream">
                            {RITUAL_CALENDAR_TITLES[k]}
                          </span>
                          {item.slots && item.slots.length > 0 && (
                            <span className="text-cream-mute">
                              {" "}
                              · {item.slots.length}{" "}
                              {item.slots.length === 1 ? "time" : "times"}
                            </span>
                          )}
                          {item.details && (
                            <div className="text-[12px] text-cream-mute mt-0.5">
                              {item.details}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </div>
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
