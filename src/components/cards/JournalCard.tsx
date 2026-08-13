"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardLabel } from "../Card";
import { PlusIcon } from "../icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { promptForThisWeek } from "@/lib/lab/prompts";
import { MENTORS, mentorByKey, mentorPrompt } from "@/lib/lab/mentors";
import type { JournalEntry } from "@/lib/lab/types";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Three ways into a blank page (Christian's call, docs/plan/05 + task 13):
// open journaling, this week's Couple Forward prompt, or a mentor's
// question. Prompted entries save the prompt as the entry title so the
// history reads honestly later.
type WriteMode = "open" | "weekly" | "mentor";

export function JournalCard({
  coupleId,
  initialEntries,
}: {
  coupleId: string;
  initialEntries: JournalEntry[];
}) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [writing, setWriting] = useState(false);
  const [mode, setMode] = useState<WriteMode>("open");
  const [mentorKey, setMentorKey] = useState<string | null>(null);
  const [promptOffset, setPromptOffset] = useState(0);
  const [draft, setDraft] = useState("");
  const [visibility, setVisibility] = useState<"couple" | "private">("couple");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mentor = mentorKey ? mentorByKey(mentorKey) : undefined;
  const activePrompt =
    mode === "weekly"
      ? promptForThisWeek()
      : mode === "mentor" && mentor
        ? mentorPrompt(mentor, promptOffset).question
        : null;

  const reset = () => {
    setWriting(false);
    setDraft("");
    setMode("open");
    setMentorKey(null);
    setPromptOffset(0);
    setError(null);
  };

  const save = async () => {
    if (!draft.trim()) return;
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        couple_id: coupleId,
        author_id: user?.id,
        content: draft.trim(),
        ...(activePrompt ? { title: activePrompt } : {}),
        // 'couple' is the column default, so omitting it keeps inserts
        // working even before the visibility migration is applied.
        ...(visibility === "private" ? { visibility } : {}),
      })
      .select()
      .single();
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEntries((prev) => [data as JournalEntry, ...prev].slice(0, 3));
    reset();
  };

  return (
    <Card id="journal" className="scroll-mt-24">
      <CardLabel>Our Journal</CardLabel>

      {entries.length === 0 && !writing && (
        <p className="mt-3 text-[13px] text-cream-mute leading-snug">
          No entries yet. Write the first one — a moment, a repair, a thing
          you don&apos;t want to forget.
        </p>
      )}

      {entries.length > 0 && (
        <div className="mt-3 space-y-2.5">
          {entries.map((e) => (
            <div key={e.id} className="text-[13px] leading-snug">
              <p className="text-cream-dim line-clamp-3">
                <span className="text-cream">{fmtDate(e.created_at)}</span>
                {e.visibility === "private" && (
                  <span className="ml-1.5 rounded-full bg-card-2 border border-line-soft/60 px-1.5 py-px text-[9px] uppercase tracking-wide text-cream-mute">
                    Private
                  </span>
                )}{" "}
                — {e.title && (
                  <span className="italic text-cream-mute">
                    {e.title}{" "}
                  </span>
                )}
                {e.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {writing ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { m: "open", label: "Blank page" },
                { m: "weekly", label: "This week's prompt" },
                { m: "mentor", label: "With a mentor" },
              ] as const
            ).map(({ m, label }) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  if (m !== "mentor") setMentorKey(null);
                }}
                className={`rounded-full px-3 py-1 text-[11px] transition ${
                  mode === m
                    ? "bg-gold text-[#1a1a1a] font-semibold"
                    : "bg-card-2/70 border border-line-soft/60 text-cream-dim hover:border-gold/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "mentor" && !mentor && (
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {MENTORS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMentorKey(m.key);
                    setPromptOffset(0);
                  }}
                  className="rounded-xl bg-card-2/70 border border-line-soft/60 px-3 py-2 text-left hover:border-gold/40 transition"
                >
                  <div className="text-[12px] font-medium text-cream">
                    {m.name}
                  </div>
                  <div className="mt-0.5 text-[10px] text-cream-mute leading-tight">
                    {m.tagline}
                  </div>
                </button>
              ))}
            </div>
          )}

          {mode === "mentor" && mentor && (
            <div className="mt-3 rounded-xl bg-gradient-to-br from-[#332515] via-[#2a2014] to-[#241a10] border border-gold/30 px-3.5 py-3">
              <p className="text-[12px] italic text-cream leading-snug">
                &ldquo;{mentorPrompt(mentor, promptOffset).quote}&rdquo;
              </p>
              <p className="mt-1 text-[10px] text-cream-mute">
                {mentor.name}, {mentorPrompt(mentor, promptOffset).source}
              </p>
              <p className="mt-2.5 text-[12.5px] text-cream-dim leading-snug">
                {mentorPrompt(mentor, promptOffset).question}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPromptOffset((o) => o + 1)}
                  className="text-[10.5px] text-gold hover:text-gold-bright transition"
                >
                  Show me another
                </button>
                <button
                  type="button"
                  onClick={() => setMentorKey(null)}
                  className="text-[10.5px] text-cream-mute hover:text-cream transition"
                >
                  Change mentor
                </button>
              </div>
            </div>
          )}

          {mode === "weekly" && (
            <div className="mt-3 rounded-xl bg-gradient-to-br from-[#332515] via-[#2a2014] to-[#241a10] border border-gold/30 px-3.5 py-3">
              <p className="text-[12.5px] text-cream leading-snug">
                {promptForThisWeek()}
              </p>
            </div>
          )}

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              mode === "open"
                ? "What happened, and what did it mean?"
                : "Write from wherever the question lands."
            }
            rows={3}
            autoFocus
            className="mt-3 w-full resize-none rounded-xl bg-card-2/80 border border-line-soft/60 px-3.5 py-2.5 text-[13px] text-cream placeholder:text-cream-mute/60 focus:outline-none focus:border-gold/50 transition"
          />
          <div className="mt-2 flex items-center gap-1.5">
            {(
              [
                { v: "couple", label: "Shared with us" },
                { v: "private", label: "Just for me" },
              ] as const
            ).map(({ v, label }) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={`rounded-full px-3 py-1 text-[11px] transition ${
                  visibility === v
                    ? "bg-gold text-[#1a1a1a] font-semibold"
                    : "bg-card-2/70 border border-line-soft/60 text-cream-dim hover:border-gold/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {error && (
            <p className="mt-2 text-[11.5px] text-[#e08a8a]">{error}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy || !draft.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold text-[#1a1a1a] px-3.5 py-1.5 text-[11.5px] font-semibold hover:bg-gold-bright transition disabled:opacity-40"
            >
              {busy ? "Saving…" : "Save entry"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-[11.5px] text-cream-dim hover:text-cream transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-gold hover:text-gold-bright transition"
          >
            <PlusIcon className="size-3.5" />
            New Entry
          </button>
          {entries.length > 0 && (
            <Link
              href="/journal"
              className="text-[11.5px] text-cream-dim hover:text-cream transition"
            >
              See all
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
