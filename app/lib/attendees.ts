import { apiRequest, type ApiResult } from "./api";
import type { AttendeeTicket, Page } from "./types";

/** Page size for the event attendee list. */
export const ATTENDEES_PAGE_SIZE = 20;

/**
 * One page of an event's attendees (`GET /events/{eventId}/tickets`).
 * Organizers only; called from the browser, so the API resolves the caller from
 * the session cookies. Never cached: the list is per-event and permission-scoped.
 */
export function fetchEventAttendees(
  eventId: string,
  page: number,
  signal?: AbortSignal,
): Promise<ApiResult<Page<AttendeeTicket>>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(ATTENDEES_PAGE_SIZE),
  });

  return apiRequest<Page<AttendeeTicket>>(
    `/events/${eventId}/tickets?${params.toString()}`,
    { credentials: "include", cache: "no-store", signal },
  );
}
