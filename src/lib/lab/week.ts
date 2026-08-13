// Huddle weeks are keyed by their Monday, formatted as a local YYYY-MM-DD
// date string. Client and server run on the same machine in dev; both use
// local time so the key never straddles a timezone boundary.
//
// DEPLOY BLOCKER (known, 2026-08-11 review): on a UTC host this diverges
// from the viewer's local Monday for part of every Sunday/Monday, so the
// server's idea of "this week" (dashboard cards, weekly prompt) can point
// at a different huddle row than the client created. Decide the fix before
// deploying: key weeks in one fixed timezone for everyone, or derive the
// week client-side and pass it to the server. Do not deploy as is.

// Local YYYY-MM-DD for daily check-in keys. Pure and client-safe: this
// module must never import server-only code (it is used in client bundles).
export function dayKey(from: Date = new Date()): string {
  const y = from.getFullYear();
  const m = (from.getMonth() + 1).toString().padStart(2, "0");
  const d = from.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function weekStart(from: Date = new Date()): string {
  const d = new Date(from);
  const day = d.getDay(); // Sun=0 … Sat=6
  const back = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - back);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
