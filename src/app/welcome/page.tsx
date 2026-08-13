"use client";

// Couple setup after sign-in for a user with no couple yet. Three entry
// states: accept a pending invite addressed to you; or start fresh, choosing
// between a couple (invite a partner) and a solo journey (a couple of one).
// Your own name is always captured here — it is what the dashboard shows.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon, CheckIcon } from "@/components/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CoupleInvite, CoupleMember } from "@/lib/lab/types";

type View =
  | { kind: "loading" }
  | { kind: "invited"; invites: CoupleInvite[] }
  | { kind: "start" }
  | { kind: "invite_partner"; coupleId: string; pending: CoupleInvite | null };

// Save the signed-in member's own display name on their couple_members row.
// Allowed by the display_name column grant + "updates own row" policy.
async function saveMyName(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  name: string,
) {
  const clean = name.trim();
  if (!clean) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("couple_members")
    .update({ display_name: clean })
    .eq("user_id", user.id);
}

export default function WelcomePage() {
  const router = useRouter();
  const [view, setView] = useState<View>({ kind: "loading" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [myName, setMyName] = useState("");

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
      setView({ kind: "start" });
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const accept = async (inviteId: string) => {
    if (myName.trim().length < 1) {
      setError("Add your name first.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.rpc("accept_couple_invite", {
      p_invite_id: inviteId,
    });
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    await saveMyName(supabase, myName);
    setBusy(false);
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
            <div className="mt-5">
              <TextField
                label="Your name"
                value={myName}
                onChange={setMyName}
                placeholder="What should we call you?"
              />
            </div>
            <div className="mt-4 space-y-3">
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

        {view.kind === "start" && (
          <StartForm onDone={() => void load()} />
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

function StartForm({ onDone }: { onDone: () => void }) {
  const [choice, setChoice] = useState<"couple" | "solo" | null>(null);
  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [togetherSince, setTogetherSince] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (myName.trim().length < 1) {
      setError("Add your name first.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { data: coupleId, error: rpcError } = await supabase.rpc(
      "create_couple",
      {
        p_name: coupleName.trim() || null,
        p_together_since: togetherSince || null,
      },
    );
    if (rpcError) {
      setBusy(false);
      setError(rpcError.message);
      return;
    }

    await saveMyName(supabase, myName);

    // Mark solo, or send the partner invite (with their name for the header).
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const cid = coupleId as string;

    if (choice === "solo") {
      await supabase.from("couples").update({ is_solo: true }).eq("id", cid);
    } else if (partnerEmail.trim().length > 3) {
      await supabase.from("couple_invites").insert({
        couple_id: cid,
        invited_email: partnerEmail.trim().toLowerCase(),
        invited_name: partnerName.trim() || null,
        invited_by: user?.id,
      });
    }

    setBusy(false);
    onDone();
  };

  if (!choice) {
    return (
      <div>
        <h1 className="text-[22px] font-semibold text-cream">
          Let&apos;s get you set up.
        </h1>
        <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
          The Lab works whether you&apos;re doing this together or on your own.
        </p>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setChoice("couple")}
            className="w-full text-left rounded-xl bg-card-2/70 border border-line-soft/70 px-5 py-4 hover:border-gold/50 transition"
          >
            <div className="text-[14.5px] font-medium text-cream">
              My partner and I
            </div>
            <div className="text-[12px] text-cream-dim mt-0.5">
              You&apos;ll invite them, and you&apos;ll share one dashboard.
            </div>
          </button>
          <button
            type="button"
            onClick={() => setChoice("solo")}
            className="w-full text-left rounded-xl bg-card-2/70 border border-line-soft/70 px-5 py-4 hover:border-gold/50 transition"
          >
            <div className="text-[14.5px] font-medium text-cream">Just me</div>
            <div className="text-[12px] text-cream-dim mt-0.5">
              Start on your own. You can invite a partner any time later.
            </div>
          </button>
        </div>
      </div>
    );
  }

  const isCouple = choice === "couple";

  return (
    <div>
      <button
        type="button"
        onClick={() => setChoice(null)}
        className="text-[12px] text-cream-dim hover:text-cream transition"
      >
        ← Back
      </button>
      <h1 className="mt-2 text-[22px] font-semibold text-cream">
        {isCouple ? "Set up your couple." : "Set up your space."}
      </h1>
      <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
        {isCouple
          ? "This creates the space you and your partner will both see."
          : "This is your private space. A partner can join it later."}
      </p>

      <div className="mt-6 space-y-3.5">
        <TextField
          label="Your name"
          value={myName}
          onChange={setMyName}
          placeholder="What should we call you?"
        />
        {isCouple && (
          <>
            <TextField
              label="Partner's name (optional)"
              value={partnerName}
              onChange={setPartnerName}
              placeholder="Their first name"
            />
            <TextField
              label="Partner's email"
              type="email"
              value={partnerEmail}
              onChange={setPartnerEmail}
              placeholder="partner@example.com"
            />
          </>
        )}
        <TextField
          label={isCouple ? "Couple name (optional)" : "Name your space (optional)"}
          value={coupleName}
          onChange={setCoupleName}
          placeholder={isCouple ? "e.g. The Charettes" : "e.g. My Compass"}
        />
        <label className="block">
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
            {isCouple ? "Together since (optional)" : "Since (optional)"}
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
        {busy
          ? "Setting up…"
          : isCouple
            ? "Create our space"
            : "Create my space"}
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
  const [name, setName] = useState("");
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
      invited_name: name.trim() || null,
      invited_by: user?.id,
    });
    // No longer solo once a partner is invited.
    await supabase.from("couples").update({ is_solo: false }).eq("id", coupleId);
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
        Your space is ready. Your partner signs in with the email you invite,
        and the two of you share one dashboard.
      </p>

      {pending ? (
        <div className="mt-6 rounded-xl bg-card-2/60 border border-line-soft/60 px-4 py-3.5">
          <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold">
            Invite pending
          </div>
          <div className="mt-1 text-[13.5px] text-cream">
            {pending.invited_name
              ? `${pending.invited_name} · ${pending.invited_email}`
              : pending.invited_email}
          </div>
          <p className="mt-1.5 text-[11.5px] text-cream-mute leading-snug">
            They&apos;ll see this invite as soon as they sign in with that
            email. Tell them to sign in at this same address.
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
        <div className="mt-6 space-y-3.5">
          <TextField
            label="Partner's name (optional)"
            value={name}
            onChange={setName}
            placeholder="Their first name"
          />
          <TextField
            label="Partner's email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="partner@example.com"
          />
          {error && <p className="text-[12.5px] text-[#e08a8a]">{error}</p>}
          <button
            type="button"
            onClick={invite}
            disabled={busy || email.trim().length < 4}
            className="w-full rounded-full bg-gold text-[#1a1a1a] px-5 py-2.5 text-[13.5px] font-semibold hover:bg-gold-bright transition disabled:opacity-40"
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

function TextField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
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
