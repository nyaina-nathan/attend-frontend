import { cacheLife, cacheTag } from "next/cache";
import { apiFetch, apiRequest } from "./api";
import { getAuthCookieHeader } from "./auth";
import type { EventDetail } from "./types";

/**
 * Result of resolving one event for the current request. `401`/`403`/`404` are
 * expected outcomes (private event / unknown id) and must not throw, so the
 * page can render the matching state instead of the error boundary.
 */
export type EventResult =
  | { ok: true; status: 200; data: EventDetail }
  | { ok: false; status: number };

/**
 * Fetch an event with the caller's cookies forwarded, so private events and
 * `myRole` resolve for organizers. Never cached: `remaining` changes quickly.
 */
export async function getEventResult(eventId: string): Promise<EventResult> {
  const cookie = await getAuthCookieHeader();

  const res = await apiRequest<EventDetail>(`/events/${eventId}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });

  if (res.ok && res.data) return { ok: true, status: 200, data: res.data };
  return { ok: false, status: res.status };
}

/**
 * Public view of an event for metadata: no cookies, so private events resolve
 * to `null` (minimal metadata) instead of leaking a title.
 *
 * Cached (`"use cache"`) because Cache Components rejects an uncached `fetch`
 * inside `generateMetadata`. Only title/description/OG fields are read from it;
 * availability is still fetched with `no-store` on the page itself.
 */
export async function getEventMetadata(eventId: string): Promise<EventDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");

  try {
    return await apiFetch<EventDetail>(`/events/${eventId}`);
  } catch {
    return null;
  }
}

/**
 * Whether the incoming request carries any auth cookie.
 */
export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getAuthCookieHeader());
}
