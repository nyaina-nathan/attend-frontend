import { cacheLife, cacheTag } from "next/cache";
import { apiFetch } from "./api";
import type { EventSummary, Page } from "./types";

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
