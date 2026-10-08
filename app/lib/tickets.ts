import { apiRequest } from "./api";
import { getAuthCookieHeader } from "./auth";
import { ticketsSearchParams } from "./tickets-query";
import type { Page, Ticket, TicketsQuery } from "./types";

/**
 * Result of loading the caller's tickets. `401` is an expected outcome (session
 * expired) and must not throw, so the page can redirect instead of crashing.
 * Any other failure — network, API down, malformed body — degrades to a
 * non-ok result the page renders as its error state.
 */
export type TicketsResult =
  | { ok: true; status: 200; data: Page<Ticket> }
  | { ok: false; status: number };

/**
 * The caller's own tickets (`GET /tickets/me`). Never cached: the payload is
 * per-user. Forwards the caller's cookies so the API resolves the right owner.
 */
export async function getMyTickets(query: TicketsQuery): Promise<TicketsResult> {
  const cookie = await getAuthCookieHeader();

  try {
    const res = await apiRequest<Page<Ticket>>(
      `/tickets/me?${ticketsSearchParams(query)}`,
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
