// Full couple-flow verification through the front-door API, using the two
// demo accounts. Run AFTER confirming their emails (see MORNING-REPORT.md).
// Exercises: sign-in both partners → create couple → invite → accept →
// huddle → answers from both sides → cross-partner visibility → completion
// → streak → connection scores → journal. Idempotent-ish: safe to re-run;
// re-completion of the same week is a no-op by design.
// Run from the repo root: node scripts/verify-flow.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const mk = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};
const die = (msg) => {
  console.error(`\nABORT: ${msg}`);
  process.exit(1);
};

function weekStart(from = new Date()) {
  const d = new Date(from);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

// ── Sign in both partners ─────────────────────────────────────────────────
const A = mk();
const B = mk();
const [ra, rb] = await Promise.all([
  A.auth.signInWithPassword({
    email: env.DEMO_PARTNER_A_EMAIL,
    password: env.DEMO_PARTNER_PASSWORD,
  }),
  B.auth.signInWithPassword({
    email: env.DEMO_PARTNER_B_EMAIL,
    password: env.DEMO_PARTNER_PASSWORD,
  }),
]);
if (ra.error?.message.includes("not confirmed") || rb.error?.message.includes("not confirmed")) {
  die(
    "Demo emails are not confirmed yet. In the Supabase dashboard → Authentication → Users, confirm jonathan.demo@ and elena.demo@coupleforward.test, then re-run.",
  );
}
if (ra.error) die(`partner A sign-in: ${ra.error.message}`);
if (rb.error) die(`partner B sign-in: ${rb.error.message}`);
const aId = ra.data.user.id;
const bId = rb.data.user.id;
check("both partners sign in", true);

// ── Couple + invite + accept (reuse if already linked) ───────────────────
let { data: aMember } = await A.from("couple_members").select("couple_id").eq("user_id", aId).maybeSingle();
if (!aMember) {
  const { data: coupleId, error } = await A.rpc("create_couple", {
    p_name: "Jonathan & Elena Demo",
    p_together_since: "2014-03-01",
  });
  if (error) die(`create_couple: ${error.message}`);
  check("A creates couple", !!coupleId);
  aMember = { couple_id: coupleId };
} else {
  check("A already in couple (reusing)", true);
}
const coupleId = aMember.couple_id;

const { data: bMember } = await B.from("couple_members").select("couple_id").eq("user_id", bId).maybeSingle();
if (!bMember) {
  const { data: existingInv } = await A.from("couple_invites")
    .select("id")
    .eq("couple_id", coupleId)
    .eq("status", "pending")
    .maybeSingle();
  let invId = existingInv?.id;
  if (!invId) {
    const { data: inv, error } = await A.from("couple_invites")
      .insert({ couple_id: coupleId, invited_email: env.DEMO_PARTNER_B_EMAIL, invited_by: aId })
      .select()
      .single();
    if (error) die(`invite insert: ${error.message}`);
    invId = inv.id;
  }
  check("A invites B", !!invId);

  const { data: bInvites } = await B.from("couple_invites").select("id").eq("status", "pending");
  check("B can see the invite", (bInvites ?? []).some((i) => i.id === invId));

  const { error: accErr } = await B.rpc("accept_couple_invite", { p_invite_id: invId });
  check("B accepts invite", !accErr, accErr?.message);
} else {
  check("B already in couple (reusing)", bMember.couple_id === coupleId);
}

// ── Huddle: A starts, both answer, B sees A's words ──────────────────────
const ws = weekStart();
let { data: huddle } = await A.from("huddles").select("*").eq("couple_id", coupleId).eq("week_start", ws).maybeSingle();
if (!huddle) {
  const { data, error } = await A.from("huddles")
    .insert({ couple_id: coupleId, week_start: ws, started_by: aId })
    .select()
    .single();
  if (error) die(`huddle insert: ${error.message}`);
  huddle = data;
}
check("this week's huddle exists", !!huddle.id);

const upsertAnswer = (client, member, stage, key, fields) =>
  client.from("huddle_answers").upsert(
    {
      huddle_id: huddle.id,
      couple_id: coupleId,
      member_user_id: member,
      stage,
      question_key: key,
      ...fields,
    },
    { onConflict: "huddle_id,member_user_id,stage,question_key" },
  );

const answerOps = await Promise.all([
  upsertAnswer(A, aId, "reflect", "worked", { answer_text: "Morning coffee ritual actually happened", updated_by: aId }),
  upsertAnswer(A, aId, "reflect", "closeness", { rating: 8, updated_by: aId }),
  upsertAnswer(B, bId, "reflect", "closeness", { rating: 7, updated_by: bId }),
  upsertAnswer(B, bId, "ask", "small_thing", { answer_text: "A real hug before you open the laptop", updated_by: bId }),
]);
check("both partners write answers", answerOps.every((r) => !r.error), answerOps.find((r) => r.error)?.error?.message);

const { data: bView } = await B.from("huddle_answers").select("*").eq("huddle_id", huddle.id);
check(
  "B sees A's reflect answer (sync via DB)",
  (bView ?? []).some((r) => r.member_user_id === aId && r.answer_text?.includes("coffee")),
);

await A.from("huddles").update({ hug_count: 14, plan: { morning: { committed: true, details: "coffee at 7, no phones" } } }).eq("id", huddle.id);

// ── Complete → streak advances ────────────────────────────────────────────
const { data: doneRows, error: doneErr } = await B.rpc("complete_huddle", { p_huddle_id: huddle.id });
const done = Array.isArray(doneRows) ? doneRows[0] : doneRows;
check("complete_huddle succeeds", !doneErr, doneErr?.message);
check("streak >= 1", (done?.current_streak ?? 0) >= 1, `streak=${done?.current_streak}`);

const { data: scores } = await A.from("connection_scores").select("*").eq("huddle_id", huddle.id);
check("closeness ratings became connection scores", (scores ?? []).length === 2, `${scores?.length} rows`);

// ── Journal ───────────────────────────────────────────────────────────────
const { error: jErr } = await A.from("journal_entries").insert({
  couple_id: coupleId,
  author_id: aId,
  content: "First huddle in the Lab. It works.",
});
check("journal entry writes", !jErr, jErr?.message);
const { data: bJournal } = await B.from("journal_entries").select("*").eq("couple_id", coupleId);
check("B reads the shared journal", (bJournal ?? []).length >= 1);

console.log(
  failures === 0
    ? "\nAll flow checks passed — open http://localhost:3000 and sign in as either demo partner to see it."
    : `\n${failures} FAILURES`,
);
process.exit(failures === 0 ? 0 : 1);
