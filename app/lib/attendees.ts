import { apiRequest, type ApiResult } from "./api";
import type { AttendeeTicket, Page, TicketStatus } from "./types";

/** Page size for the event attendee list. */
export const ATTENDEES_PAGE_SIZE = 20;

/** Filters accepted by `GET /events/{eventId}/tickets`. */
export interface AttendeesQuery {
  page: number;
  status?: TicketStatus;
  tierId?: string;
  /** Partial match on the attendee's name or username. */
  q?: string;
}

/**
 * One page of an event's attendees (`GET /events/{eventId}/tickets`).
 * Organizers only; called from the browser, so the API resolves the caller from
 * the session cookies. Never cached: the list is per-event and permission-scoped.
 */
export function fetchEventAttendees(
  eventId: string,
  query: AttendeesQuery,
  signal?: AbortSignal,
): Promise<ApiResult<Page<AttendeeTicket>>> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(ATTENDEES_PAGE_SIZE),
  });
  if (query.status) params.set("status", query.status);
  if (query.tierId) params.set("tierId", query.tierId);
  if (query.q) params.set("q", query.q);

  return apiRequest<Page<AttendeeTicket>>(
    `/events/${eventId}/tickets?${params.toString()}`,
    { credentials: "include", cache: "no-store", signal },
  );
}
