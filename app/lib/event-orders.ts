import { apiRequest, type ApiResult } from "./api";
import type { Order, OrderStatus, Page } from "./types";

/** Page size for the event order list. */
export const EVENT_ORDERS_PAGE_SIZE = 20;

/** Filters accepted by `GET /events/{eventId}/orders`. */
export interface EventOrdersQuery {
  page: number;
  status?: OrderStatus;
}

/**
 * Organizer-facing orders calls. Kept together so the event orders page can
 * list, approve and refuse orders without touching the API shape directly.
 * Called from the browser, so the API resolves the caller from session cookies.
 */

/** One page of an event's orders (`GET /events/{eventId}/orders`). Organizers only. */
export function fetchEventOrders(
  eventId: string,
  query: EventOrdersQuery,
  signal?: AbortSignal,
): Promise<ApiResult<Page<Order>>> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(EVENT_ORDERS_PAGE_SIZE),
  });
  if (query.status) params.set("status", query.status);

  return apiRequest<Page<Order>>(
    `/events/${eventId}/orders?${params.toString()}`,
    { credentials: "include", cache: "no-store", signal },
  );
}

/**
 * Approve a `PENDING` order (`POST /orders/{orderId}/approve`). Issues the
 * tickets for every item; disallowed once the order is no longer pending or a
 * tier is sold out (409).
 */
export function approveOrder(orderId: string): Promise<ApiResult<Order>> {
  return apiRequest<Order>(`/orders/${orderId}/approve`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
}

/**
 * Refuse a `PENDING` order (`POST /orders/{orderId}/refuse`). A `reason` is
 * required and is recorded on the order.
 */
export function refuseOrder(
  orderId: string,
  reason: string,
): Promise<ApiResult<Order>> {
  return apiRequest<Order>(`/orders/${orderId}/refuse`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}
