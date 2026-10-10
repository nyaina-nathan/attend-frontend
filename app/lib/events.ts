import { cacheLife, cacheTag } from "next/cache";
import { apiFetch, apiRequest } from "./api";
import { getAuthCookieHeader } from "./auth";
import type { EventSummary, EventsQuery, Page } from "./types";

/** Serialize a normalized query into `GET /events` search params. */
function eventsSearchParams(query: EventsQuery, mine: boolean): string {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  params.set("status", query.status);

  if (mine) {
    params.set("isMine", "true");
    if (query.isPublic !== undefined) params.set("isPublic", String(query.isPublic));
  }

  params.set("page", String(query.page));
  params.set("size", String(query.size));
  params.set("sort", query.sort);

  return params.toString();
}

/**
 * Public event listing for the `/events` page.
 *
 * Cached for a minute (Cache Components) and tagged `events`, so a future
 * create/cancel action can `revalidateTag("events")`. Cookies are deliberately
 * not sent: the public listing is identical for anonymous and authenticated
 * callers. Errors propagate so the page can render its error state.
 */
export async function getEvents(query: EventsQuery): Promise<Page<EventSummary>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");

  return apiFetch<Page<EventSummary>>(`/events?${eventsSearchParams(query, false)}`);
}

/**
 * The caller's own events (organizer view). Never cached on the server — it is
 * per-user — and forwards the request cookies so `isMine` takes effect.
 */
export async function getMyEvents(query: EventsQuery): Promise<Page<EventSummary>> {
  const cookie = await getAuthCookieHeader();

  return apiFetch<Page<EventSummary>>(`/events?${eventsSearchParams(query, true)}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

/**
 * Result of loading the caller's own events for the dashboard. `401` is an
 * expected outcome (session expired) and must not throw, so the page can
 * redirect instead of crashing. Any other failure — network, API down,
 * malformed body — degrades to a non-ok result the page renders as its error
 * state.
 */
export type MyEventsResult =
  | { ok: true; status: 200; data: Page<EventSummary> }
  | { ok: false; status: number };

/**
 * The caller's own events (`GET /events?isMine=true`). Never cached: the payload
 * is per-user. Forwards the caller's cookies so `isMine` takes effect. Always
 * sends `isMine=true`, so the dashboard can only ever list events the caller
 * organizes.
 */
export async function getMyEventsResult(query: EventsQuery): Promise<MyEventsResult> {
  const cookie = await getAuthCookieHeader();

  try {
    const res = await apiRequest<Page<EventSummary>>(
      `/events?${eventsSearchParams(query, true)}`,
      {
        cache: "no-store",
        headers: cookie ? { cookie } : undefined,
      },
    );

    if (res.ok && res.data) return { ok: true, status: 200, data: res.data };
    return { ok: false, status: res.status };
  } catch {
    // Network/parse failure: surface as a generic error state (status 0).
    return { ok: false, status: 0 };
  }
}

/**
 * Public upcoming events for the landing page.
 *
 * Cached for a minute (Cache Components), tagged `events` so a future
 * create/cancel action can `revalidateTag("events")`. Any failure — API down,
 * not configured, empty body — degrades to an empty list so the landing page
 * still renders its empty state instead of breaking the build.
 */
export async function getUpcomingEvents(limit = 6): Promise<EventSummary[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");

  try {
    const page = await apiFetch<Page<EventSummary>>(
      `/events?status=OK&sort=startTime,asc&size=${limit}`,
    );
    return (page.content ?? []).filter((event) => event.status === "OK");
  } catch {
    return [];
  }
}
