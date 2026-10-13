import { apiRequest, type ApiResult } from "./api";
import { paymentTypeLabel } from "./payment-methods";
import type { Order, OrderCreateInput, PaymentMethod } from "./types";

/**
 * Client-side checkout calls. Kept together so the checkout page can fetch an
 * event's payable methods and submit an order without reaching into the API
 * shape directly.
 */

/** Human label for a payment method option, e.g. `Bank transfer — Acme (Ada)`. */
export function paymentMethodLabel(method: PaymentMethod): string {
  return `${paymentTypeLabel(method.paymentType)} — ${method.providerName} (${method.accountName})`;
}

/** Active payment methods a buyer can pay with (`GET /events/{id}/payment-methods`). */
export function fetchEventPaymentMethods(
  eventId: string,
): Promise<ApiResult<PaymentMethod[]>> {
  return apiRequest<PaymentMethod[]>(`/events/${eventId}/payment-methods`, {
    credentials: "include",
    cache: "no-store",
  });
}

/** Create a `PENDING` order (`POST /events/{id}/orders`). */
export function createOrder(
  eventId: string,
  input: OrderCreateInput,
): Promise<ApiResult<Order>> {
  return apiRequest<Order>(`/events/${eventId}/orders`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
