import { apiRequest, type ApiResult } from "./api";
import type { CheckInResponse } from "./types";

/**
 * Check in a ticket by id (`POST /tickets/{ticketId}/check-in`). Called from the
 * browser scanner: the API resolves the organizer from the session cookies and
 * the event from the ticket, so no event id is sent.
 *
 * Client-safe on purpose: unlike `tickets.ts`, this module avoids `./auth`
 * (and its `next/headers` import) so it can be bundled into the client Scanner.
 */
export function checkInTicket(
  ticketId: string,
): Promise<ApiResult<CheckInResponse>> {
  return apiRequest<CheckInResponse>(`/tickets/${ticketId}/check-in`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
}
