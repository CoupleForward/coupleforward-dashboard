"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await createSupabaseBrowserClient().auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
      className="ml-1 inline-flex items-center rounded-full border border-line-soft px-3.5 py-1.5 text-[12px] font-medium text-cream-dim hover:text-cream hover:border-line transition"
    >
      Sign out
    </button>
  );
}
