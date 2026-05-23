const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Human-relative time for session continuity copy. */
export function formatContinuityRelativeTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Recently";

  const delta = Math.max(0, now - then);
  if (delta < MINUTE) return "Just now";
  if (delta < HOUR) {
    const m = Math.floor(delta / MINUTE);
    return `${m}m ago`;
  }
  if (delta < DAY) {
    const h = Math.floor(delta / HOUR);
    return `${h}h ago`;
  }
  if (delta < 2 * DAY) return "Yesterday";
  const d = Math.floor(delta / DAY);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
