"use client";

// Downloads everything the couple owns, straight from the browser under
// the same RLS the app runs on. Nothing extra is fetched server-side and
// nothing leaves the device except the normal authenticated reads.

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { DownloadIcon } from "./icons";

function download(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

type SupabaseBrowser = ReturnType<typeof createSupabaseBrowserClient>;

// Supabase caps unranged selects at 1000 rows silently. A "complete copy"
// has to page through everything, so every large table goes through this.
// Order by an IMMUTABLE column only — paging on a mutable timestamp can
// drop or duplicate rows if the other partner edits mid-export.
async function fetchAll(
  supabase: SupabaseBrowser,
  table: string,
  coupleId: string,
  orderBy: string,
): Promise<Record<string, unknown>[]> {
  const PAGE = 1000;
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("couple_id", coupleId)
      .order(orderBy, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as Record<string, unknown>[]));
    if (!data || data.length < PAGE) return rows;
  }
}

export function ExportDataButton({ coupleId }: { coupleId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const exportData = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const supabase = createSupabaseBrowserClient();
      const [couple, members, huddleRowsAll, answerRows, journalRows, scoreRows] =
        await Promise.all([
          supabase.from("couples").select("*").eq("id", coupleId).single(),
          supabase.from("couple_members").select("*").eq("couple_id", coupleId),
          fetchAll(supabase, "huddles", coupleId, "week_start"),
          fetchAll(supabase, "huddle_answers", coupleId, "id"),
          fetchAll(supabase, "journal_entries", coupleId, "created_at"),
          fetchAll(supabase, "connection_scores", coupleId, "created_at"),
        ]);

      const firstError = couple.error ?? members.error;
      if (firstError) throw new Error(firstError.message);

      // Human-shaped export: names and weeks, not internal UUIDs. The file
      // is meant to be read and kept by the couple, and it may get shared
      // onward (a therapist, a backup folder) — so it carries no key
      // material, only their own words and numbers.
      type Row = Record<string, unknown>;
      const memberRows = (members.data ?? []) as Row[];
      const nameOf = (userId: unknown): string => {
        const m = memberRows.find((x) => x.user_id === userId);
        const dn = typeof m?.display_name === "string" ? m.display_name : "";
        return dn || "Partner";
      };
      const huddleRows = huddleRowsAll;
      const weekOf = new Map<unknown, unknown>(
        huddleRows.map((h) => [h.id, h.week_start]),
      );
      const coupleRow = (couple.data ?? {}) as Row;

      const payload = {
        exported_at: new Date().toISOString(),
        note: "Your Couple Forward Lab data. Huddle answers and journal entries are intimate content: store this file somewhere private.",
        couple: {
          name: coupleRow.name,
          together_since: coupleRow.together_since,
          member_since: coupleRow.created_at,
          current_streak: coupleRow.current_streak,
          longest_streak: coupleRow.longest_streak,
        },
        members: memberRows.map((m) => ({
          name: nameOf(m.user_id),
          role: m.role,
          joined_at: m.joined_at,
        })),
        huddles: huddleRows.map((h) => ({
          week_start: h.week_start,
          status: h.status,
          hug_count: h.hug_count,
          plan: h.plan,
          commit_prefs: h.commit_prefs,
          completed_at: h.completed_at,
        })),
        huddle_answers: answerRows.map((a) => ({
          week_start: weekOf.get(a.huddle_id) ?? null,
          partner: nameOf(a.member_user_id),
          stage: a.stage,
          question_key: a.question_key,
          answer_text: a.answer_text,
          rating: a.rating,
          updated_at: a.updated_at,
        })),
        journal_entries: journalRows.map((j) => ({
          author: nameOf(j.author_id),
          title: j.title,
          content: j.content,
          created_at: j.created_at,
        })),
        connection_scores: scoreRows.map((s) => ({
          week_start: weekOf.get(s.huddle_id) ?? null,
          partner: nameOf(s.user_id),
          score: s.score,
          source: s.source,
          created_at: s.created_at,
        })),
      };
      const stamp = new Date().toISOString().slice(0, 10);
      download(
        `couple-forward-data-${stamp}.json`,
        JSON.stringify(payload, null, 2),
        "application/json",
      );
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={exportData}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-gold text-[#1a1a1a] px-4 py-2 text-[12.5px] font-semibold hover:bg-gold-bright transition disabled:opacity-40"
      >
        <DownloadIcon className="size-4" />
        {busy ? "Preparing…" : "Download your data"}
      </button>
      {done && (
        <p className="mt-2 text-[12px] text-cream-dim">
          Saved. The file includes every Huddle, answer, journal entry, and
          score your couple has recorded.
        </p>
      )}
      {error && <p className="mt-2 text-[12px] text-[#e08a8a]">{error}</p>}
    </div>
  );
}
