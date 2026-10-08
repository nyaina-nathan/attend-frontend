import type { TicketStatus, TicketsQuery } from "./types";

/** Page size for the tickets list. */
export const TICKETS_PAGE_SIZE = 20;

/** The caller's tickets default to upcoming events only. */
export const DEFAULT_UPCOMING = true;

export const TICKET_STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "VALID", label: "Valid" },
  { value: "USED", label: "Used" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface ParsedTicketsView {
  query: TicketsQuery;
  /** Canonical, non-default params used to build shareable links. */
  params: Record<string, string>;
  hasFilters: boolean;
}

export interface TicketFilterChip {
  key: string;
  label: string;
  /** Param keys this chip removes when clicked. */
  remove: string[];
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function parseStatus(value: string | undefined): TicketStatus | undefined {
  return TICKET_STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as TicketStatus)
    : undefined;
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/** Anything other than an explicit `false` keeps the upcoming-only default. */
function parseUpcoming(value: string | undefined): boolean {
  return value !== "false";
}

/**
 * Turn raw URL search params into a normalized query plus a canonical,
 * non-default param map used to build shareable links (chips, pagination,
 * reset). `upcoming=true` is the default, so it is omitted from `params`.
 */
export function parseTicketsSearchParams(raw: RawSearchParams): ParsedTicketsView {
  const status = parseStatus(first(raw.status));
  const upcoming = parseUpcoming(first(raw.upcoming));
  const page = parsePage(first(raw.page));

  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (!upcoming) params.upcoming = "false";

  return {
    query: { status, upcoming, page, size: TICKETS_PAGE_SIZE },
    params,
    hasFilters: Object.keys(params).length > 0,
  };
}

export function buildTicketsHref(params: Record<string, string>, page = 0): string {
  const search = new URLSearchParams(params);
  if (page > 0) search.set("page", String(page));
  const query = search.toString();
  return query ? `/dashboard/tickets?${query}` : "/dashboard/tickets";
}

export function removeTicketFilterHref(
  params: Record<string, string>,
  keys: string[],
): string {
  const next = { ...params };
  for (const key of keys) delete next[key];
  return buildTicketsHref(next);
}

/** Serialize a normalized query into `GET /tickets/me` search params. */
export function ticketsSearchParams(query: TicketsQuery): string {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  params.set("upcoming", String(query.upcoming));
  params.set("page", String(query.page));
  params.set("size", String(query.size));
  return params.toString();
}

export function ticketChipsFromParams(
  params: Record<string, string>,
): TicketFilterChip[] {
  const chips: TicketFilterChip[] = [];

  if (params.status) {
    chips.push({
      key: "status",
      label: statusLabel(params.status),
      remove: ["status"],
    });
  }

  if (params.upcoming === "false") {
    chips.push({ key: "upcoming", label: "All tickets", remove: ["upcoming"] });
  }

  return chips;
}

function statusLabel(value: string): string {
  return (
    TICKET_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}
