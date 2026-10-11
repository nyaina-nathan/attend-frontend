import { apiRequest } from "./api";
import { getAuthCookieHeader } from "./auth";
import type { Organizer } from "./types";

/**
 * Result of loading an event's organizers. `401`/`403`/`404` are expected
 * outcomes (session gone / not an organizer / unknown id) and must not throw,
 * so the section can render the matching state instead of the error boundary.
 * Any other failure degrades to a non-ok result it renders as its error state.
 */
export type OrganizersResult =
  | { ok: true; status: 200; data: Organizer[] }
  | { ok: false; status: number };

/**
 * Organizers of an event (`GET /events/{eventId}/organizers`). Organizers only.
 * Never cached: the payload is per-event and permission-scoped. Forwards the
 * caller's cookies so the API can authorize the request.
 */
export async function getEventOrganizers(
  eventId: string,
): Promise<OrganizersResult> {
  const cookie = await getAuthCookieHeader();

  try {
    const res = await apiRequest<Organizer[]>(
      `/events/${eventId}/organizers`,
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
