"use client";

// Couple setup: accept a pending invite addressed to you, or create your
// couple and invite your partner. Reached after sign-in when the user has
// no couple yet (or an incomplete one).

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon, CheckIcon } from "@/components/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CoupleInvite, CoupleMember } from "@/lib/lab/types";

type View =
  | { kind: "loading" }
  | { kind: "invited"; invites: CoupleInvite[] }
  | { kind: "create" }
  | { kind: "invite_partner"; coupleId: string; pending: CoupleInvite | null };

export default function WelcomePage() {
  const router = useRouter();
  const [view, setView] = useState<View>({ kind: "loading" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    const { data: membership } = await supabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership) {
      const { data: members } = await supabase
        .from("couple_members")
        .select("*")
        .eq("couple_id", membership.couple_id);
      if ((members as CoupleMember[] | null)?.length === 2) {
        router.replace("/");
        return;
      }
      const { data: invites } = await supabase
        .from("couple_invites")
        .select("*")
        .eq("couple_id", membership.couple_id)
        .eq("status", "pending");
      setView({
        kind: "invite_partner",
        coupleId: membership.couple_id,
        pending: (invites?.[0] as CoupleInvite | undefined) ?? null,
      });
      return;
    }

    // Not in a couple: is there an invite addressed to my email?
    const { data: invites } = await supabase
      .from("couple_invites")
      .select("*")
      .eq("status", "pending")
      .ilike("invited_email", user.email ?? "");
    if (invites && invites.length > 0) {
      setView({ kind: "invited", invites: invites as CoupleInvite[] });
    } else {
      setView({ kind: "create" });
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const accept = async (inviteId: string) => {
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.rpc("accept_couple_invite", {
      p_invite_id: inviteId,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg text-cream flex flex-col items-center justify-center px-5 py-10">
      <div className="flex items-center gap-2.5 mb-10">
        <HeartIcon className="size-6 text-gold" />
        <span className="font-medium tracking-[0.22em] text-[13px] text-cream">
          COUPLE FORWARD LAB
        </span>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-card border border-line-soft px-6 py-7">
        {view.kind === "loading" && (
          <p className="text-[13px] text-cream-mute">Loading…</p>
        )}

        {view.kind === "invited" && (
          <div>
            <h1 className="text-[22px] font-semibold text-cream">
              You&apos;ve been invited.
            </h1>
            <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
              Your partner set up your couple&apos;s dashboard and invited you
              to join it.
            </p>
            <div className="mt-5 space-y-3">
              {view.invites.map((inv) => (
                <button
                  key={inv.id}
                  type="button"
                  disabled={busy}
                  onClick={() => accept(inv.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gold text-[#1a1a1a] px-5 py-2.5 text-[13.5px] font-semibold hover:bg-gold-bright transition disabled:opacity-40"
                >
                  <CheckIcon className="size-4" />
                  {busy ? "Joining…" : "Join your couple"}
                </button>
              ))}
            </div>
            {error && (
              <p className="mt-4 text-[12.5px] text-[#e08a8a]">{error}</p>
            )}
          </div>
        )}

        {view.kind === "create" && (
          <CreateCoupleForm
            onDone={() => void load()}
            onError={setError}
            error={error}
          />
        )}

        {view.kind === "invite_partner" && (
          <InvitePartnerForm
            coupleId={view.coupleId}
            pending={view.pending}
            onChanged={() => void load()}
          />
        )}
      </div>
    </div>
  );
}

function CreateCoupleForm({
  onDone,
  onError,
  error,
}: {
  onDone: () => void;
  onError: (e: string | null) => void;
  error: string | null;
}) {
  const [coupleName, setCoupleName] = useState("");
  const [togetherSince, setTogetherSince] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    onError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.rpc("create_couple", {
      p_name: coupleName.trim() || null,
      p_together_since: togetherSince || null,
    });
    setBusy(false);
    if (error) {
      onError(error.message);
      return;
    }
    onDone();
  };

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-cream">
        Set up your couple.
      </h1>
      <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
        This creates the shared space you and your partner will both see.
        You&apos;ll invite them in the next step.
      </p>
      <div className="mt-6 space-y-3.5">
        <label className="block">
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
            Couple name (optional)
          </span>
          <input
            type="text"
            value={coupleName}
            onChange={(e) => setCoupleName(e.target.value)}
            placeholder="e.g. The Charettes"
            className="mt-1.5 w-full rounded-xl bg-card-2/80 border border-line-soft/60 px-4 py-2.5 text-[13.5px] text-cream placeholder:text-cream-mute/60 focus:outline-none focus:border-gold/50 transition"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
            Together since (optional)
          </span>
          <input
            type="date"
            value={togetherSince}
            onChange={(e) => setTogetherSince(e.target.value)}
            className="mt-1.5 w-full rounded-xl bg-card-2/80 border border-line-soft/60 px-4 py-2.5 text-[13.5px] text-cream focus:outline-none focus:border-gold/50 transition [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
          />
        </label>
      </div>
      {error && <p className="mt-4 text-[12.5px] text-[#e08a8a]">{error}</p>}
      <button
        type="button"
        onClick={create}
        disabled={busy}
        className="mt-6 w-full rounded-full bg-gold text-[#1a1a1a] px-5 py-2.5 text-[13.5px] font-semibold hover:bg-gold-bright transition disabled:opacity-40"
      >
        {busy ? "Creating…" : "Create our space"}
      </button>
    </div>
  );
}

function InvitePartnerForm({
  coupleId,
  pending,
  onChanged,
}: {
  coupleId: string;
  pending: CoupleInvite | null;
  onChanged: () => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invite = async () => {
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("couple_invites").insert({
      couple_id: coupleId,
      invited_email: email.trim().toLowerCase(),
      invited_by: user?.id,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    onChanged();
  };

  const revoke = async () => {
    if (!pending) return;
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("couple_invites")
      .update({ status: "revoked" })
      .eq("id", pending.id);
    setBusy(false);
    onChanged();
  };

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-cream">
        Invite your partner.
      </h1>
      <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
        Your space is ready. Your partner creates their own account with the
        email you invite, and the two of you share one dashboard.
      </p>

      {pending ? (
        <div className="mt-6 rounded-xl bg-card-2/60 border border-line-soft/60 px-4 py-3.5">
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold">
            Invite pending
          </div>
          <div className="mt-1 text-[13.5px] text-cream">
            {pending.invited_email}
          </div>
          <p className="mt-1.5 text-[11.5px] text-cream-mute leading-snug">
            They&apos;ll see this invite as soon as they sign in with that
            email. No email is sent yet — tell them to create an account at
            this same address.
          </p>
          <button
            type="button"
            onClick={revoke}
            disabled={busy}
            className="mt-3 text-[11.5px] text-cream-dim hover:text-cream transition"
          >
            Revoke invite
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <label className="block">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
              Partner&apos;s email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
              className="mt-1.5 w-full rounded-xl bg-card-2/80 border border-line-soft/60 px-4 py-2.5 text-[13.5px] text-cream placeholder:text-cream-mute/60 focus:outline-none focus:border-gold/50 transition"
            />
          </label>
          {error && (
            <p className="mt-3 text-[12.5px] text-[#e08a8a]">{error}</p>
          )}
          <button
            type="button"
            onClick={invite}
            disabled={busy || email.trim().length < 4}
            className="mt-4 w-full rounded-full bg-gold text-[#1a1a1a] px-5 py-2.5 text-[13.5px] font-semibold hover:bg-gold-bright transition disabled:opacity-40"
          >
            {busy ? "Inviting…" : "Send invite"}
          </button>
        </div>
      )}

      <Link
        href="/"
        className="mt-5 block text-center text-[12px] text-cream-dim hover:text-cream transition"
      >
        Continue to the dashboard →
      </Link>
    </div>
  );
}
