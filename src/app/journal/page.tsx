import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ArrowLeftIcon } from "@/components/icons";
import { coupleDisplayName, getLabContext } from "@/lib/lab/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JournalEntry } from "@/lib/lab/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 200;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// The journal's full history — the dashboard card shows the latest three,
// this page keeps all of them reachable.
export default async function JournalPage() {
  const ctx = await getLabContext();
  if (ctx.state === "signed_out") redirect("/login");
  if (ctx.state === "no_couple") redirect("/welcome");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("couple_id", ctx.couple.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);
  const entries = (data ?? []) as JournalEntry[];

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
            <div className="max-w-[640px]">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[12px] text-cream-dim hover:text-cream transition"
              >
                <ArrowLeftIcon className="size-3.5" />
                Dashboard
              </Link>

              <h1 className="mt-3 text-[22px] font-semibold text-cream">
                Our Journal
              </h1>
              <p className="mt-1 text-[13px] text-cream-dim">
                Everything you both have written, newest first. New entries
                start from the journal card on your dashboard.
              </p>

              {entries.length === 0 ? (
                <Card className="mt-6">
                  <p className="text-[13px] text-cream-mute leading-relaxed">
                    No entries yet. The first one starts on your dashboard: a
                    moment, a repair, a thing you don&apos;t want to forget.
                  </p>
                </Card>
              ) : (
                <div className="mt-6 space-y-3">
                  {entries.map((e) => (
                    <Card key={e.id}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[12px] text-cream">
                          {fmtDate(e.created_at)}
                          {e.visibility === "private" && (
                            <span className="ml-2 rounded-full bg-card-2 border border-line-soft/60 px-1.5 py-px text-[9px] uppercase tracking-wide text-cream-mute">
                              Private · only you
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] tracking-[0.14em] uppercase text-gold">
                          {nameFor(e.author_id)}
                        </span>
                      </div>
                      {e.title && (
                        <div className="mt-1.5 text-[14px] font-medium text-cream">
                          {e.title}
                        </div>
                      )}
                      <p className="mt-1.5 text-[13px] text-cream-dim leading-relaxed whitespace-pre-wrap">
                        {e.content}
                      </p>
                    </Card>
                  ))}
                  {entries.length === PAGE_SIZE && (
                    <p className="text-[11.5px] text-cream-mute">
                      Showing your {PAGE_SIZE} most recent entries. The full
                      set is always in your data export.
                    </p>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <MobileNav active="journal" />
    </div>
  );
}
