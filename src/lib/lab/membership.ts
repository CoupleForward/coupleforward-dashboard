// Lab entitlement gate.
//
// STUB: always active until Stripe wiring lands. The intended source of
// truth already exists — profiles.dashboard_access (set by the checkout
// provisioning flow in coupleforward-web). When payments are wired, replace
// the body with the commented query and gate the dashboard on it.

import type { SupabaseClient } from "@supabase/supabase-js";

export type Membership = {
  active: boolean;
  plan: "founding" | "member";
};

export async function getMembership(
  _supabase: SupabaseClient,
  _userId: string,
): Promise<Membership> {
  // const { data } = await _supabase
  //   .from("profiles")
  //   .select("dashboard_access")
  //   .eq("id", _userId)
  //   .single();
  // return { active: !!data?.dashboard_access, plan: "member" };
  return { active: true, plan: "founding" };
}
