"use client";

// Add-a-partner-later (Account page): for solo starts and skipped invites.
// Shows the current partner state: joined, invite pending (with revoke),
// or the invite form. Inviting flips the couple out of solo mode; the
// invite greets the partner the moment they sign in with that email.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CoupleInvite } from "@/lib/lab/types";

export function PartnerInvite({
  coupleId,
  pending,
}: {
  coupleId: string;
  pending: CoupleInvite | null;
}) {
  const router = useRouter();
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
    if (!error) {
      await supabase
        .from("couples")
        .update({ is_solo: false })
        .eq("id", coupleId);
    }
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
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
    router.refresh();
  };

  if (pending) {
    return (
      <div className="rounded-xl bg-card-2/60 border border-line-soft/60 px-4 py-3.5">
        <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold">
          Invite pending
        </div>
        <div className="mt-1 text-[13.5px] text-cream">
          {pending.invited_name
            ? `${pending.invited_name} · ${pending.invited_email}`
            : pending.invited_email}
        </div>
        <p className="mt-1.5 text-[11.5px] text-cream-mute leading-snug">
          No email goes out yet. They&apos;ll see this invite the moment they
          sign in with that address.
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
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-cream-dim leading-relaxed">
        Going solo is a full membership. And whenever you&apos;re ready, your
        partner can join this same space: everything you build here is
        waiting for them.
      </p>
      <label className="block">
        <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
          Partner&apos;s name (optional)
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Their first name"
          className="mt-1.5 w-full rounded-xl bg-card-2/80 border border-line-soft/60 px-4 py-2.5 text-[13.5px] text-cream placeholder:text-cream-mute/60 focus:outline-none focus:border-gold/50 transition"
        />
      </label>
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
      {error && <p className="text-[12.5px] text-[#e08a8a]">{error}</p>}
      <button
        type="button"
        onClick={invite}
        disabled={busy || email.trim().length < 4}
        className="rounded-full bg-gold text-[#1a1a1a] px-4 py-2 text-[12px] font-semibold hover:bg-gold-bright transition disabled:opacity-40"
      >
        {busy ? "Inviting…" : "Send invite"}
      </button>
    </div>
  );
}
