// Huddle weeks are keyed by their Monday, formatted as a local YYYY-MM-DD
// date string. Client and server run on the same machine in dev; both use
// local time so the key never straddles a timezone boundary.

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
