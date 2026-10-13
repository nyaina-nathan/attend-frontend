/**
 * Whether an event's end time has already passed. Kept as a plain helper so
 * server components can call it without touching the clock inline (which the
 * React purity lint rule forbids during render). An unparseable date is treated
 * as "not ended" so a bad value never hides ticket sales.
 */
export function hasEventEnded(endTime: string, now: number = Date.now()): boolean {
  const endMs = new Date(endTime).getTime();
  return Number.isFinite(endMs) && now >= endMs;
}
