"use client";

import { useState } from "react";
import { Card, CardLabel } from "../Card";
import { PlusIcon } from "../icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/lib/lab/types";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function JournalCard({
  coupleId,
  initialEntries,
}: {
  coupleId: string;
  initialEntries: JournalEntry[];
}) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      })
      .select()
      .single();
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEntries((prev) => [data as JournalEntry, ...prev].slice(0, 3));
    setDraft("");
    setWriting(false);
  };

  return (
    <Card>
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
            <p
              key={e.id}
              className="text-[13px] text-cream-dim leading-snug line-clamp-3"
            >
              <span className="text-cream">{fmtDate(e.created_at)}</span> —{" "}
              {e.content}
            </p>
          ))}
        </div>
      )}

      {writing ? (
        <div className="mt-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What happened, and what did it mean?"
            rows={3}
            autoFocus
            className="w-full resize-none rounded-xl bg-card-2/80 border border-line-soft/60 px-3.5 py-2.5 text-[13px] text-cream placeholder:text-cream-mute/60 focus:outline-none focus:border-gold/50 transition"
          />
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
              onClick={() => {
                setWriting(false);
                setDraft("");
              }}
              className="text-[11.5px] text-cream-dim hover:text-cream transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setWriting(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-gold hover:text-gold-bright transition"
        >
          <PlusIcon className="size-3.5" />
          New Entry
        </button>
      )}
    </Card>
  );
}
