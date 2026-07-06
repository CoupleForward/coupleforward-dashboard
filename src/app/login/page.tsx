"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeartIcon } from "@/components/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "auth" ? "Sign-in link failed — try again." : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createSupabaseBrowserClient();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.replace("/");
        router.refresh();
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setNotice(
            "Check your email to confirm your account, then sign in here.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setNotice("Magic link sent — check your email.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    email.trim().length > 3 &&
    (mode === "magic" || password.length >= 6) &&
    (mode !== "signup" || fullName.trim().length > 0);

  return (
    <div className="min-h-screen bg-bg text-cream flex flex-col items-center justify-center px-5">
      <div className="flex items-center gap-2.5 mb-10">
        <HeartIcon className="size-6 text-gold" />
        <span className="font-medium tracking-[0.22em] text-[13px] text-cream">
          COUPLE FORWARD LAB
        </span>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-card border border-line-soft px-6 py-7">
        <h1 className="text-[22px] font-semibold text-cream">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
          {mode === "signup"
            ? "One account per partner — you'll link up as a couple next."
            : "Sign in to your couple's dashboard."}
        </p>

        <div className="mt-6 space-y-3.5">
          {mode === "signup" && (
            <Field
              label="Your name"
              type="text"
              value={fullName}
              onChange={setFullName}
              placeholder="First and last name"
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          {mode !== "magic" && (
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === "signup" ? "At least 6 characters" : ""}
            />
          )}
        </div>

        {error && (
          <p className="mt-4 text-[12.5px] text-[#e08a8a] leading-snug">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 text-[12.5px] text-gold leading-snug">{notice}</p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || busy}
          className="mt-6 w-full rounded-full bg-gold text-[#1a1a1a] px-5 py-2.5 text-[13.5px] font-semibold hover:bg-gold-bright transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy
            ? "One moment…"
            : mode === "signin"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : "Send magic link"}
        </button>

        <div className="mt-5 flex flex-col gap-2 text-[12px] text-cream-dim">
          {mode !== "magic" && (
            <button
              type="button"
              onClick={() => setMode("magic")}
              className="text-left hover:text-cream transition"
            >
              Email me a magic link instead
            </button>
          )}
          {mode !== "signin" && (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="text-left hover:text-cream transition"
            >
              Sign in with a password
            </button>
          )}
          {mode !== "signup" && (
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="text-left hover:text-cream transition"
            >
              New here? <span className="text-gold">Create an account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl bg-card-2/80 border border-line-soft/60 px-4 py-2.5 text-[13.5px] text-cream placeholder:text-cream-mute/60 focus:outline-none focus:border-gold/50 transition"
      />
    </label>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
