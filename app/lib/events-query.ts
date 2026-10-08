import type { EventSort, EventStatus, EventsQuery } from "./types";

/** Page size for the events grid (3 columns × 4 rows on desktop). */
export const EVENTS_PAGE_SIZE = 12;

export const DEFAULT_STATUS: EventStatus = "OK";
export const DEFAULT_SORT: EventSort = "startTime,asc";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "OK", label: "Active" },
  { value: "POSTPONED", label: "Postponed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const SORT_OPTIONS: { value: EventSort; label: string }[] = [
  { value: "startTime,asc", label: "Soonest first" },
  { value: "startTime,desc", label: "Latest first" },
];

/** Quick date presets; the ranges themselves are computed on demand. */
export const DATE_PRESET_DEFS = [
  { id: "today", label: "Today" },
  { id: "weekend", label: "This weekend" },
  { id: "month", label: "This month" },
] as const;

export interface ParsedEventsView {
  query: EventsQuery;
  /** Canonical, non-default params used to build shareable links. */
  params: Record<string, string>;
  hasFilters: boolean;
}

export interface EventsFilterChip {
  key: string;
  label: string;
  /** Param keys this chip removes when clicked. */
  remove: string[];
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function parseStatus(value: string | undefined): EventStatus {
  return value === "POSTPONED" || value === "CANCELLED" ? value : DEFAULT_STATUS;
}

function parseSort(value: string | undefined): EventSort {
  return value === "startTime,desc" ? value : DEFAULT_SORT;
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function parseBool(value: string | undefined): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

/**
 * Turn raw URL search params into a normalized query plus a canonical,
 * non-default param map used to build shareable links (chips, pagination,
 * reset). `isMine`/`isPublic` are only honored for authenticated callers;
 * anonymous requests are silently downgraded to the public listing.
 */
export function parseEventsSearchParams(
  raw: RawSearchParams,
  { isAuthenticated }: { isAuthenticated: boolean },
): ParsedEventsView {
  const q = first(raw.q)?.trim() || undefined;
  const from = parseIso(first(raw.from));
  const to = parseIso(first(raw.to));
  const status = parseStatus(first(raw.status));
  const sort = parseSort(first(raw.sort));
  const page = parsePage(first(raw.page));

  const isMine = isAuthenticated && first(raw.isMine) === "true";
  const isPublic = isMine ? parseBool(first(raw.isPublic)) : undefined;

  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (from) params.from = from;
  if (to) params.to = to;
  if (status !== DEFAULT_STATUS) params.status = status;
  if (sort !== DEFAULT_SORT) params.sort = sort;
  if (isMine) {
    params.isMine = "true";
    if (isPublic !== undefined) params.isPublic = String(isPublic);
  }

  return {
    query: { q, from, to, status, isMine, isPublic, page, size: EVENTS_PAGE_SIZE, sort },
    params,
    hasFilters: Object.keys(params).length > 0,
  };
}

export function buildEventsHref(params: Record<string, string>, page = 0): string {
  const search = new URLSearchParams(params);
  if (page > 0) search.set("page", String(page));
  const query = search.toString();
  return query ? `/events?${query}` : "/events";
}

export function removeFilterHref(params: Record<string, string>, keys: string[]): string {
  const next = { ...params };
  for (const key of keys) delete next[key];
  return buildEventsHref(next);
}

/**
 * Chip descriptors for the active filters. The date label is timezone-dependent,
 * so `FilterChips` swaps it for a neutral label until after mount.
 */
export function chipsFromParams(params: Record<string, string>): EventsFilterChip[] {
  const chips: EventsFilterChip[] = [];

  if (params.q) chips.push({ key: "q", label: `“${params.q}”`, remove: ["q"] });

  if (params.from || params.to) {
    chips.push({ key: "range", label: formatDateRange(params.from, params.to), remove: ["from", "to"] });
  }

  if (params.status) {
    chips.push({ key: "status", label: statusLabel(params.status), remove: ["status"] });
  }

  if (params.isMine === "true") {
    chips.push({ key: "isMine", label: "My events", remove: ["isMine", "isPublic"] });
  }

  if (params.isPublic) {
    chips.push({
      key: "isPublic",
      label: params.isPublic === "true" ? "Public" : "Private",
      remove: ["isPublic"],
    });
  }

  if (params.sort) {
    chips.push({ key: "sort", label: sortLabel(params.sort), remove: ["sort"] });
  }

  return chips;
}

function statusLabel(value: string): string {
  return STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function sortLabel(value: string): string {
  return SORT_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function formatDateRange(from?: string, to?: string): string {
  const start = from ? new Date(from) : undefined;
  const end = to ? new Date(to) : undefined;
  const startLabel = start && !Number.isNaN(start.getTime()) ? dateFormatter.format(start) : undefined;
  const endLabel = end && !Number.isNaN(end.getTime()) ? dateFormatter.format(end) : undefined;

  if (startLabel && endLabel) return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  if (startLabel) return `From ${startLabel}`;
  if (endLabel) return `Until ${endLabel}`;
  return "Date range";
}

/** UTC calendar date (`YYYY-MM-DD`); identical on server and client. */
export function isoToUtcDateInput(iso: string | undefined | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

/** Local calendar date (`YYYY-MM-DD`) for a native date input. */
export function isoToLocalDateInput(iso: string | undefined | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): [number, number, number] | undefined {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return undefined;
  return [parts[0], parts[1], parts[2]];
}

/** Local start-of-day -> UTC ISO, as sent to the API. */
export function localDateInputToFromISO(value: string): string | undefined {
  const parts = parseDateInput(value);
  if (!parts) return undefined;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
}

/** Local end-of-day -> UTC ISO, as sent to the API. */
export function localDateInputToToISO(value: string): string | undefined {
  const parts = parseDateInput(value);
  if (!parts) return undefined;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}

export interface DatePreset {
  id: string;
  label: string;
  from: string;
  to: string;
}

/** Local-timezone date ranges for the quick presets. */
export function getDatePresets(now: Date = new Date()): DatePreset[] {
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

  const weekendStart = new Date(now);
  weekendStart.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
  const weekendEnd = new Date(weekendStart);
  weekendEnd.setDate(weekendStart.getDate() + 1);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return [
    { id: "today", label: "Today", from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() },
    { id: "weekend", label: "This weekend", from: startOfDay(weekendStart).toISOString(), to: endOfDay(weekendEnd).toISOString() },
    { id: "month", label: "This month", from: startOfDay(monthStart).toISOString(), to: endOfDay(monthEnd).toISOString() },
  ];
}
