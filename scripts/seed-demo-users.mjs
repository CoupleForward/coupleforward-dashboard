// Creates the two local demo users through the normal signup API.
// Idempotent: re-running against existing users reports and exits.
// Reads config from .env.local — run from the repo root: node scripts/seed-demo-users.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const supabaseFor = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

for (const [email, full_name] of [
  [env.DEMO_PARTNER_A_EMAIL, "Jonathan Demo"],
  [env.DEMO_PARTNER_B_EMAIL, "Elena Demo"],
]) {
  const supabase = supabaseFor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: env.DEMO_PARTNER_PASSWORD,
    options: { data: { full_name } },
  });
  if (error) {
    console.log(email, "SIGNUP ERROR:", error.message);
    continue;
  }
  console.log(
    email,
    "| user:", data.user?.id ?? "none",
    "| session:", data.session ? "YES (autoconfirm on)" : "NO (email confirmation required)",
    "| confirmed_at:", data.user?.email_confirmed_at ?? "null",
  );
}
