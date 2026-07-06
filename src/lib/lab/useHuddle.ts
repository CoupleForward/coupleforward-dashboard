"use client";

// Client-side state + sync engine for the weekly huddle.
//
// Source of truth is Supabase; this hook keeps a local HuddleState mirror,
// debounces writes per field, and merges remote changes in via a realtime
// subscription plus a refetch on window focus. A field the user touched in
// the last few seconds is never overwritten by a remote value, so two
// partners can type on two devices without clobbering each other.

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PlanState } from "@/lib/huddle";
import { weekStart } from "./week";
import type {
  CommitPrefs,
  Couple,
  CoupleMember,
  Huddle,
  HuddleAnswer,
  HuddleStage,
} from "./types";

export type DualAnswer = { a: string; b: string };
export type Slot = "a" | "b";

export type ReflectAnswers = {
  hugCount: number;
  closenessA: number;
  closenessB: number;
  worked: DualAnswer;
  didntWork: DualAnswer;
  loved: DualAnswer;
};

export type AskAnswers = {
  plate: DualAnswer;
  smallThing: DualAnswer;
  intentions: DualAnswer;
};

export type CommitState = {
  addToCalendar: boolean;
  setReminders: boolean;
  emailSummary: boolean;
};

export type HuddleUIState = {
  reflect: ReflectAnswers;
  ask: AskAnswers;
  plan: PlanState;
  commit: CommitState;
};

export const initialPlan: PlanState = {
  morning: { committed: false, details: "" },
  evening: { committed: false, details: "" },
  convos: { committed: false, details: "", slots: [] },
  dinners: { committed: false, details: "", slots: [], menuIdeas: "" },
  adventure: { committed: false, details: "", slots: [] },
  familyFriends: { committed: false, details: "" },
  personal: { committed: false, details: "" },
};

const emptyDual: DualAnswer = { a: "", b: "" };

export const initialUIState: HuddleUIState = {
  reflect: {
    hugCount: 0,
    closenessA: 0,
    closenessB: 0,
    worked: { ...emptyDual },
    didntWork: { ...emptyDual },
    loved: { ...emptyDual },
  },
  ask: {
    plate: { ...emptyDual },
    smallThing: { ...emptyDual },
    intentions: { ...emptyDual },
  },
  plan: initialPlan,
  commit: { addToCalendar: true, setReminders: true, emailSummary: false },
};

// question_key values as stored in huddle_answers
const DUAL_KEYS: Record<string, { stage: HuddleStage; key: string }> = {
  worked: { stage: "reflect", key: "worked" },
  didntWork: { stage: "reflect", key: "didnt_work" },
  loved: { stage: "reflect", key: "loved" },
  plate: { stage: "ask", key: "plate" },
  smallThing: { stage: "ask", key: "small_thing" },
  intentions: { stage: "ask", key: "intentions" },
};

type DualField = keyof typeof DUAL_KEYS;

export type UseHuddleResult = {
  status: "loading" | "signed_out" | "no_couple" | "ready";
  couple: Couple | null;
  members: CoupleMember[];
  names: { a: string; b: string };
  soloPartner: boolean;
  completed: boolean;
  streak: { current: number; longest: number } | null;
  state: HuddleUIState;
  setHugCount: (n: number) => void;
  setCloseness: (slot: Slot, n: number) => void;
  setDual: (field: DualField, v: DualAnswer) => void;
  setPlan: (p: PlanState) => void;
  setCommit: (c: CommitState) => void;
  complete: () => Promise<string | null>; // error message or null
};

export function useHuddle(): UseHuddleResult {
  const [status, setStatus] = useState<UseHuddleResult["status"]>("loading");
  const [couple, setCouple] = useState<Couple | null>(null);
  const [members, setMembers] = useState<CoupleMember[]>([]);
  const [huddle, setHuddle] = useState<Huddle | null>(null);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState<UseHuddleResult["streak"]>(null);
  const [state, setState] = useState<HuddleUIState>(initialUIState);

  const supabaseRef = useRef(
    typeof window !== "undefined" ? createSupabaseBrowserClient() : null,
  );
  const userIdRef = useRef<string | null>(null);
  const huddleRef = useRef<Huddle | null>(null);
  const membersRef = useRef<CoupleMember[]>([]);
  // fieldId -> last local edit ts; guards remote merges
  const editedAt = useRef<Map<string, number>>(new Map());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
    huddleRef.current = huddle;
    membersRef.current = members;
  }, [state, huddle, members]);

  const memberForSlot = useCallback((slot: Slot): CoupleMember | null => {
    return membersRef.current[slot === "a" ? 0 : 1] ?? null;
  }, []);

  const slotForMember = useCallback((userId: string): Slot | null => {
    const idx = membersRef.current.findIndex((m) => m.user_id === userId);
    return idx === 0 ? "a" : idx === 1 ? "b" : null;
  }, []);

  const markEdited = (fieldId: string) => {
    editedAt.current.set(fieldId, Date.now());
  };
  const recentlyEdited = (fieldId: string) => {
    const t = editedAt.current.get(fieldId);
    return t !== undefined && Date.now() - t < 3000;
  };

  const debounce = (fieldId: string, fn: () => void, ms = 600) => {
    const existing = timers.current.get(fieldId);
    if (existing) clearTimeout(existing);
    timers.current.set(
      fieldId,
      setTimeout(() => {
        timers.current.delete(fieldId);
        fn();
      }, ms),
    );
  };

  const persistAnswer = useCallback(
    async (
      stage: HuddleStage,
      key: string,
      slot: Slot,
      value: { text?: string; rating?: number },
    ) => {
      const sb = supabaseRef.current;
      const h = huddleRef.current;
      const member = memberForSlot(slot);
      if (!sb || !h || !member) return;
      const { error } = await sb.from("huddle_answers").upsert(
        {
          huddle_id: h.id,
          couple_id: h.couple_id,
          member_user_id: member.user_id,
          stage,
          question_key: key,
          ...(value.text !== undefined ? { answer_text: value.text } : {}),
          ...(value.rating !== undefined ? { rating: value.rating } : {}),
          updated_by: userIdRef.current,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "huddle_id,member_user_id,stage,question_key" },
      );
      if (error) console.error("answer save failed:", error.message);
    },
    [memberForSlot],
  );

  const persistHuddleFields = useCallback(async (fields: Partial<Huddle>) => {
    const sb = supabaseRef.current;
    const h = huddleRef.current;
    if (!sb || !h) return;
    const { error } = await sb
      .from("huddles")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", h.id);
    if (error) console.error("huddle save failed:", error.message);
  }, []);

  // Map DB rows into UI state (used on load and focus refetch).
  const applyAnswers = useCallback(
    (answers: HuddleAnswer[], respectRecentEdits: boolean) => {
      setState((prev) => {
        const next: HuddleUIState = structuredClone(prev);
        for (const a of answers) {
          const slot = slotForMember(a.member_user_id);
          if (!slot) continue;
          if (a.question_key === "closeness") {
            const fieldId = `closeness:${slot}`;
            if (respectRecentEdits && recentlyEdited(fieldId)) continue;
            if (slot === "a") next.reflect.closenessA = a.rating ?? 0;
            else next.reflect.closenessB = a.rating ?? 0;
            continue;
          }
          const entry = Object.entries(DUAL_KEYS).find(
            ([, v]) => v.stage === a.stage && v.key === a.question_key,
          );
          if (!entry) continue;
          const field = entry[0] as DualField;
          const fieldId = `${a.stage}:${a.question_key}:${slot}`;
          if (respectRecentEdits && recentlyEdited(fieldId)) continue;
          const bucket =
            a.stage === "reflect"
              ? (next.reflect as unknown as Record<string, DualAnswer>)
              : (next.ask as unknown as Record<string, DualAnswer>);
          bucket[field] = { ...bucket[field], [slot]: a.answer_text ?? "" };
        }
        return next;
      });
    },
    [slotForMember],
  );

  const applyHuddleRow = useCallback(
    (h: Huddle, respectRecentEdits: boolean) => {
      setHuddle((prev) => (prev && prev.id !== h.id ? prev : h));
      setState((prev) => {
        const next = structuredClone(prev);
        if (!respectRecentEdits || !recentlyEdited("hug_count")) {
          next.reflect.hugCount = h.hug_count;
        }
        if (!respectRecentEdits || !recentlyEdited("plan")) {
          next.plan = { ...initialPlan, ...(h.plan as PlanState) };
        }
        if (!respectRecentEdits || !recentlyEdited("commit")) {
          next.commit = { ...prev.commit, ...(h.commit_prefs as CommitPrefs) };
        }
        return next;
      });
      if (h.status === "completed") setCompleted(true);
    },
    [],
  );

  const refetch = useCallback(async () => {
    const sb = supabaseRef.current;
    const h = huddleRef.current;
    if (!sb || !h) return;
    const [{ data: row }, { data: answers }, { data: c }] = await Promise.all([
      sb.from("huddles").select("*").eq("id", h.id).maybeSingle(),
      sb.from("huddle_answers").select("*").eq("huddle_id", h.id),
      sb.from("couples").select("*").eq("id", h.couple_id).maybeSingle(),
    ]);
    if (row) applyHuddleRow(row as Huddle, true);
    if (answers) applyAnswers(answers as HuddleAnswer[], true);
    if (c) {
      setCouple(c as Couple);
      setStreak({
        current: (c as Couple).current_streak,
        longest: (c as Couple).longest_streak,
      });
    }
  }, [applyAnswers, applyHuddleRow]);

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    const sb = supabaseRef.current;
    if (!sb) return;
    let cancelled = false;
    let channel: RealtimeChannel | null = null;

    (async () => {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setStatus("signed_out");
        return;
      }
      userIdRef.current = user.id;

      const { data: membership } = await sb
        .from("couple_members")
        .select("couple_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!membership) {
        setStatus("no_couple");
        return;
      }

      const [{ data: coupleRow }, { data: memberRows }] = await Promise.all([
        sb.from("couples").select("*").eq("id", membership.couple_id).single(),
        sb
          .from("couple_members")
          .select("*")
          .eq("couple_id", membership.couple_id)
          .order("joined_at", { ascending: true }),
      ]);
      if (cancelled || !coupleRow) return;
      const ordered = [...(memberRows ?? [])].sort((a, b) =>
        a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0,
      ) as CoupleMember[];
      setCouple(coupleRow as Couple);
      setMembers(ordered);
      membersRef.current = ordered;
      setStreak({
        current: (coupleRow as Couple).current_streak,
        longest: (coupleRow as Couple).longest_streak,
      });

      // This week's huddle: select, insert if missing, re-select on race.
      const ws = weekStart();
      let row: Huddle | null = null;
      const { data: existing } = await sb
        .from("huddles")
        .select("*")
        .eq("couple_id", coupleRow.id)
        .eq("week_start", ws)
        .maybeSingle();
      row = (existing as Huddle | null) ?? null;
      if (!row) {
        const { data: created, error } = await sb
          .from("huddles")
          .insert({
            couple_id: coupleRow.id,
            week_start: ws,
            started_by: user.id,
          })
          .select()
          .single();
        if (error) {
          // 23505 = the partner created it a moment ago; fetch theirs.
          const { data: theirs } = await sb
            .from("huddles")
            .select("*")
            .eq("couple_id", coupleRow.id)
            .eq("week_start", ws)
            .maybeSingle();
          row = (theirs as Huddle | null) ?? null;
        } else {
          row = created as Huddle;
        }
      }
      if (cancelled || !row) return;
      huddleRef.current = row;
      setHuddle(row);
      applyHuddleRow(row, false);

      const { data: answers } = await sb
        .from("huddle_answers")
        .select("*")
        .eq("huddle_id", row.id);
      if (cancelled) return;
      if (answers) applyAnswers(answers as HuddleAnswer[], false);

      // ── Realtime: my partner's edits appear live ─────────────────────
      channel = sb
        .channel(`huddle-${row.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "huddle_answers",
            filter: `huddle_id=eq.${row.id}`,
          },
          (payload) => {
            const a = payload.new as HuddleAnswer;
            if (!a?.id) return;
            if (a.updated_by === userIdRef.current) return; // own echo
            applyAnswers([a], true);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "huddles",
            filter: `id=eq.${row.id}`,
          },
          (payload) => {
            const h = payload.new as Huddle;
            if (!h?.id) return;
            applyHuddleRow(h, true);
            if (h.status === "completed") void refetch(); // pick up streak
          },
        )
        .subscribe();

      setStatus("ready");
    })();

    return () => {
      cancelled = true;
      if (channel) void sb.removeChannel(channel);
    };
  }, [applyAnswers, applyHuddleRow, refetch]);

  // Refetch when the tab regains focus (covers missed realtime events).
  useEffect(() => {
    const onFocus = () => void refetch();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refetch]);

  // ── Setters (local state + debounced persistence) ─────────────────────
  const setHugCount = useCallback(
    (n: number) => {
      markEdited("hug_count");
      setState((s) => ({ ...s, reflect: { ...s.reflect, hugCount: n } }));
      debounce("hug_count", () => persistHuddleFields({ hug_count: n }));
    },
    [persistHuddleFields],
  );

  const setCloseness = useCallback(
    (slot: Slot, n: number) => {
      markEdited(`closeness:${slot}`);
      setState((s) => ({
        ...s,
        reflect: {
          ...s.reflect,
          ...(slot === "a" ? { closenessA: n } : { closenessB: n }),
        },
      }));
      debounce(`closeness:${slot}`, () =>
        persistAnswer("reflect", "closeness", slot, { rating: n }),
      );
    },
    [persistAnswer],
  );

  const setDual = useCallback(
    (field: DualField, v: DualAnswer) => {
      const { stage, key } = DUAL_KEYS[field];
      const prev = (
        stage === "reflect"
          ? (stateRef.current.reflect as unknown as Record<string, DualAnswer>)
          : (stateRef.current.ask as unknown as Record<string, DualAnswer>)
      )[field];
      setState((s) => ({
        ...s,
        [stage]: {
          ...s[stage],
          [field]: v,
        },
      }));
      for (const slot of ["a", "b"] as const) {
        if (v[slot] !== prev[slot]) {
          const fieldId = `${stage}:${key}:${slot}`;
          markEdited(fieldId);
          debounce(fieldId, () =>
            persistAnswer(stage, key, slot, { text: v[slot] }),
          );
        }
      }
    },
    [persistAnswer],
  );

  const setPlan = useCallback(
    (p: PlanState) => {
      markEdited("plan");
      setState((s) => ({ ...s, plan: p }));
      debounce("plan", () => persistHuddleFields({ plan: p }));
    },
    [persistHuddleFields],
  );

  const setCommit = useCallback(
    (c: CommitState) => {
      markEdited("commit");
      setState((s) => ({ ...s, commit: c }));
      debounce("commit", () => persistHuddleFields({ commit_prefs: c }));
    },
    [persistHuddleFields],
  );

  const complete = useCallback(async (): Promise<string | null> => {
    const sb = supabaseRef.current;
    const h = huddleRef.current;
    if (!sb || !h) return "Not ready yet — try again in a second.";
    // Flush pending debounced writes and wait for them, so the closeness
    // ratings are committed before complete_huddle copies them into
    // connection_scores.
    for (const [, t] of timers.current) clearTimeout(t);
    timers.current.clear();
    const flushes: Promise<void>[] = [
      persistHuddleFields({
        hug_count: stateRef.current.reflect.hugCount,
        plan: stateRef.current.plan,
        commit_prefs: stateRef.current.commit,
      }),
    ];
    for (const field of Object.keys(DUAL_KEYS) as DualField[]) {
      const { stage, key } = DUAL_KEYS[field];
      const v = (
        stage === "reflect"
          ? (stateRef.current.reflect as unknown as Record<string, DualAnswer>)
          : (stateRef.current.ask as unknown as Record<string, DualAnswer>)
      )[field];
      for (const slot of ["a", "b"] as const) {
        if (v[slot].trim() !== "" && (slot === "a" || membersRef.current.length > 1)) {
          flushes.push(persistAnswer(stage, key, slot, { text: v[slot] }));
        }
      }
    }
    if (stateRef.current.reflect.closenessA > 0) {
      flushes.push(
        persistAnswer("reflect", "closeness", "a", {
          rating: stateRef.current.reflect.closenessA,
        }),
      );
    }
    if (membersRef.current.length > 1 && stateRef.current.reflect.closenessB > 0) {
      flushes.push(
        persistAnswer("reflect", "closeness", "b", {
          rating: stateRef.current.reflect.closenessB,
        }),
      );
    }
    await Promise.all(flushes);
    const { data, error } = await sb.rpc("complete_huddle", {
      p_huddle_id: h.id,
    });
    if (error) return error.message;
    const rowOut = Array.isArray(data) ? data[0] : data;
    if (rowOut) {
      setStreak({
        current: rowOut.current_streak as number,
        longest: rowOut.longest_streak as number,
      });
    }
    setCompleted(true);
    return null;
  }, [persistAnswer, persistHuddleFields]);

  const firstName = (m: CoupleMember | null, fallback: string) =>
    (m?.display_name ?? "").split(" ")[0] || fallback;

  return {
    status,
    couple,
    members,
    names: {
      a: firstName(members[0] ?? null, "Partner A"),
      b: firstName(members[1] ?? null, "Your partner"),
    },
    soloPartner: members.length < 2,
    completed,
    streak,
    state,
    setHugCount,
    setCloseness,
    setDual,
    setPlan,
    setCommit,
    complete,
  };
}
