import { apiRequest } from "./api";
import { getAuthCookieHeader } from "./auth";
import type { DashboardResponse } from "./types";

/**
 * Result of loading the dashboard. `401` is an expected outcome (session
 * expired) and must not throw, so the page can redirect instead of crashing.
 * Any other failure — network, API down, malformed body — also degrades to a
 * non-ok result the page renders as its error state.
 */
export type DashboardResult =
  | { ok: true; status: 200; data: DashboardResponse }
  | { ok: false; status: number };

/**
 * Aggregate dashboard call. Never cached: the payload is per-user and changes
 * with every ticket sale. Forwards the caller's cookies so the API resolves the
 * right organizer/attendee activity.
 */
export async function getDashboard(): Promise<DashboardResult> {
  const cookie = await getAuthCookieHeader();

  try {
    const res = await apiRequest<DashboardResponse>("/users/me/dashboard", {
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
    });

    if (res.ok && res.data) return { ok: true, status: 200, data: res.data };
    return { ok: false, status: res.status };
  } catch {
    // Network/parse failure: surface as a generic error state (status 0).
    return { ok: false, status: 0 };
  }
}
