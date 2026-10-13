import { apiRequest } from "./api";
import { getAuthCookieHeader } from "./auth";
import { getEventResult } from "./event";
import { ordersSearchParams } from "./orders-query";
import type { EventDetail, Order, OrdersQuery, Page } from "./types";

/**
 * Result of loading the caller's orders. `401` is an expected outcome (session
 * expired) and must not throw, so the page can redirect instead of crashing.
 * Any other failure — network, API down, malformed body — degrades to a
 * non-ok result the page renders as its error state.
 */
export type OrdersResult =
  | { ok: true; status: 200; data: Page<Order> }
  | { ok: false; status: number };

/**
 * The caller's own orders (`GET /orders/me`), newest first. Never cached: the
 * payload is per-user. Forwards the caller's cookies so the API resolves the
 * right owner.
 */
export async function getMyOrders(query: OrdersQuery): Promise<OrdersResult> {
  const cookie = await getAuthCookieHeader();

  try {
    const res = await apiRequest<Page<Order>>(
      `/orders/me?${ordersSearchParams(query)}`,
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
 * Resolve the events behind a page of orders. Orders carry only an `eventId`,
 * so this fetches each distinct event once (cookie-scoped for private events).
 * Failures are skipped, letting the row fall back to the bare order data.
 */
export async function getOrderEvents(
  ids: string[],
): Promise<Map<string, EventDetail>> {
  const unique = Array.from(new Set(ids));

  const entries = await Promise.all(
    unique.map(async (id) => {
      const result = await getEventResult(id);
      return result.ok ? ([id, result.data] as const) : null;
    }),
  );

  return new Map(
    entries.filter(
      (entry): entry is readonly [string, EventDetail] => entry !== null,
    ),
  );
}
