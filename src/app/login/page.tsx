"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeartIcon } from "@/components/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Magic-link-only sign-in (2026-08-12 decision). One email field: the same
// flow signs existing members in and creates new ones (signInWithOtp with
// shouldCreateUser defaulting true). No passwords. Google sign-in is planned
// as a Supabase provider later; it will slot in above the email field.
function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "auth"
      ? "That sign-in link didn't work. Request a fresh one below, and open it in this same browser."
      : null,
  );
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = email.trim().length > 3;

  return (
    <div className="min-h-screen bg-bg text-cream flex flex-col items-center justify-center px-5">
      <div className="flex items-center gap-2.5 mb-10">
        <HeartIcon className="size-6 text-gold" />
        <span className="font-medium tracking-[0.22em] text-[13px] text-cream">
          COUPLE FORWARD LAB
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !busy) submit();
        }}
        className="w-full max-w-sm rounded-2xl bg-card border border-line-soft px-6 py-7"
      >
        {sent ? (
          <div>
            <h1 className="text-[22px] font-semibold text-cream">
              Check your email.
            </h1>
            <p className="mt-2 text-[13px] text-cream-dim leading-relaxed">
              We sent a sign-in link to{" "}
              <span className="text-cream">{email.trim()}</span>. Open it in
              this same browser and you&apos;re in. The link is good for one
              hour.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setError(null);
              }}
              className="mt-5 text-[12px] text-cream-dim hover:text-cream transition"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-[22px] font-semibold text-cream">
              Sign in to the Lab
            </h1>
            <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
              Enter your email and we&apos;ll send you a sign-in link. New
              here? The same link creates your account.
            </p>

            <div className="mt-6">
              <label className="block">
                <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
                  Email
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-xl bg-card-2/80 border border-line-soft/60 px-4 py-2.5 text-[13.5px] text-cream placeholder:text-cream-mute/60 focus:outline-none focus:border-gold/50 transition"
                />
              </label>
            </div>

            {error && (
              <p className="mt-4 text-[12.5px] text-[#e08a8a] leading-snug">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || busy}
              className="mt-6 w-full rounded-full bg-gold text-[#1a1a1a] px-5 py-2.5 text-[13.5px] font-semibold hover:bg-gold-bright transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? "Sending…" : "Email me a sign-in link"}
            </button>

            <p className="mt-4 text-[11px] text-cream-mute leading-snug">
              Request the link and open it in the same browser you&apos;re in
              now. That keeps the sign-in secure.
            </p>
          </>
        )}
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
