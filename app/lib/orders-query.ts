import type { OrderStatus, OrdersQuery } from "./types";

/** Page size for the orders list. */
export const ORDERS_PAGE_SIZE = 20;

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REFUSED", label: "Refused" },
  { value: "CANCELLED", label: "Cancelled" },
];

export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface ParsedOrdersView {
  query: OrdersQuery;
  /** Canonical, non-default params used to build shareable links. */
  params: Record<string, string>;
  hasFilters: boolean;
}

export interface OrderFilterChip {
  key: string;
  label: string;
  /** Param keys this chip removes when clicked. */
  remove: string[];
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function parseStatus(value: string | undefined): OrderStatus | undefined {
  return ORDER_STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as OrderStatus)
    : undefined;
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Turn raw URL search params into a normalized query plus a canonical,
 * non-default param map used to build shareable links (chips, pagination,
 * reset).
 */
export function parseOrdersSearchParams(raw: RawSearchParams): ParsedOrdersView {
  const status = parseStatus(first(raw.status));
  const page = parsePage(first(raw.page));

  const params: Record<string, string> = {};
  if (status) params.status = status;

  return {
    query: { status, page, size: ORDERS_PAGE_SIZE },
    params,
    hasFilters: Object.keys(params).length > 0,
  };
}

export function buildOrdersHref(params: Record<string, string>, page = 0): string {
  const search = new URLSearchParams(params);
  if (page > 0) search.set("page", String(page));
  const query = search.toString();
  return query ? `/dashboard/orders?${query}` : "/dashboard/orders";
}

export function removeOrderFilterHref(
  params: Record<string, string>,
  keys: string[],
): string {
  const next = { ...params };
  for (const key of keys) delete next[key];
  return buildOrdersHref(next);
}

/** Serialize a normalized query into `GET /orders/me` search params. */
export function ordersSearchParams(query: OrdersQuery): string {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  params.set("page", String(query.page));
  params.set("size", String(query.size));
  return params.toString();
}

export function orderChipsFromParams(
  params: Record<string, string>,
): OrderFilterChip[] {
  const chips: OrderFilterChip[] = [];

  if (params.status) {
    chips.push({
      key: "status",
      label: statusLabel(params.status),
      remove: ["status"],
    });
  }

  return chips;
}

function statusLabel(value: string): string {
  return (
    ORDER_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}
