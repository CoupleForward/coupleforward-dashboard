"use client";

// Each partner sets their own birthday (column-grant enforced: you can only
// update your own row). Powers the 4,000 Weeks horizon: weeks lived, weeks
// left, and the couple's shared horizon.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function BirthdaySetter({
  userId,
  initial,
  partnerName,
  partnerBirthday,
}: {
  userId: string;
  initial: string | null;
  partnerName: string | null;
  partnerBirthday: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!value) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("couple_members")
      .update({ birthday: value })
      .eq("user_id", userId);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  };

  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
          Your birthday
        </span>
        <div className="mt-1.5 flex gap-2">
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="flex-1 rounded-xl bg-card-2/80 border border-line-soft/60 px-4 py-2.5 text-[13.5px] text-cream focus:outline-none focus:border-gold/50 transition [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
          />
          <button
            type="button"
            onClick={save}
            disabled={!value || busy || value === initial}
            className="rounded-full bg-gold text-[#1a1a1a] px-4 py-2 text-[12px] font-semibold hover:bg-gold-bright transition disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </label>
      {error && <p className="text-[11.5px] text-[#e08a8a]">{error}</p>}
      {saved && (
        <p className="text-[11.5px] text-cream-dim">
          Saved. Your weeks now show on the 4,000 Weeks card.
        </p>
      )}
      {partnerName && (
        <p className="text-[11.5px] text-cream-mute">
          {partnerBirthday
            ? `${partnerName}: ${fmt(partnerBirthday)} (they set their own)`
            : `${partnerName} hasn't added theirs yet. Each of you sets your own.`}
        </p>
      )}
      <p className="text-[11px] text-cream-mute leading-relaxed">
        Used for one thing only: counting your weeks on the 4,000 Weeks
        horizon, together and individually.
      </p>
    </div>
  );
}
