// RLS safety net, runnable with no session: the anon role must see zero
// rows in every Lab table, must not be able to write, and the RPCs must
// reject unauthenticated callers. Exits non-zero on any failure.
// Run from the repo root: node scripts/test-rls-anon.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

const LAB_TABLES = [
  "couples",
  "couple_members",
  "couple_invites",
  "huddles",
  "huddle_answers",
  "journal_entries",
  "connection_scores",
];

for (const t of LAB_TABLES) {
  const { data, error } = await sb.from(t).select("*").limit(5);
  check(
    `anon sees zero rows in ${t}`,
    !error && Array.isArray(data) && data.length === 0,
    error ? error.message : `${data?.length ?? "?"} rows`,
  );
}

{
  const { error } = await sb
    .from("couples")
    .insert({ name: "rls-probe" });
  check("anon cannot insert into couples", !!error, error?.message ?? "insert allowed!");
}
{
  const { error } = await sb.from("huddle_answers").insert({
    huddle_id: "00000000-0000-0000-0000-000000000000",
    couple_id: "00000000-0000-0000-0000-000000000000",
    member_user_id: "00000000-0000-0000-0000-000000000000",
    stage: "reflect",
    question_key: "worked",
    answer_text: "rls-probe",
  });
  check("anon cannot insert into huddle_answers", !!error, error?.message ?? "insert allowed!");
}
{
  const { error } = await sb.rpc("create_couple", { p_name: "rls-probe" });
  check("create_couple rejects anon", !!error, error?.message ?? "rpc succeeded!");
}
{
  const { error } = await sb.rpc("complete_huddle", {
    p_huddle_id: "00000000-0000-0000-0000-000000000000",
  });
  check("complete_huddle rejects anon", !!error, error?.message ?? "rpc succeeded!");
}

console.log(failures === 0 ? "\nAll anon RLS checks passed." : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
