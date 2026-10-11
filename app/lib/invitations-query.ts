import type {
  InvitationDirection,
  InvitationStatus,
  InvitationsQuery,
} from "./types";

/** Page size for the invitations list. */
export const INVITATIONS_PAGE_SIZE = 20;

/** The list opens on invitations addressed to the caller. */
export const DEFAULT_DIRECTION: InvitationDirection = "received";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const DIRECTION_OPTIONS: { value: InvitationDirection; label: string }[] = [
  { value: "received", label: "Received" },
  { value: "sent", label: "Sent" },
];

export const INVITATION_STATUS_OPTIONS: {
  value: InvitationStatus;
  label: string;
}[] = [
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DECLINED", label: "Declined" },
];

export interface ParsedInvitationsView {
  query: InvitationsQuery;
  /** Canonical, non-default params used to build shareable links. */
  params: Record<string, string>;
  /** Whether a status filter (not the section itself) is active. */
  hasFilters: boolean;
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function parseDirection(value: string | undefined): InvitationDirection {
  return value === "sent" ? "sent" : DEFAULT_DIRECTION;
}

function parseStatus(value: string | undefined): InvitationStatus | undefined {
  return INVITATION_STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as InvitationStatus)
    : undefined;
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Turn raw URL search params into a normalized query plus a canonical,
 * non-default param map used to build shareable links (pagination, reset).
 * `direction=received` is the default, so it is omitted from `params`; the
 * switch between the received and sent sections is therefore URL-driven.
 */
export function parseInvitationsSearchParams(
  raw: RawSearchParams,
): ParsedInvitationsView {
  const direction = parseDirection(first(raw.direction));
  const status = parseStatus(first(raw.status));
  const page = parsePage(first(raw.page));

  const params: Record<string, string> = {};
  if (direction !== DEFAULT_DIRECTION) params.direction = direction;
  if (status) params.status = status;

  return {
    query: { direction, status, page, size: INVITATIONS_PAGE_SIZE },
    params,
    hasFilters: status !== undefined,
  };
}

export function buildInvitationsHref(
  params: Record<string, string>,
  page = 0,
): string {
  const search = new URLSearchParams(params);
  if (page > 0) search.set("page", String(page));
  const query = search.toString();
  return query ? `/dashboard/invitations?${query}` : "/dashboard/invitations";
}

/** Serialize a normalized query into `GET /invitations` search params. */
export function invitationsSearchParams(query: InvitationsQuery): string {
  const params = new URLSearchParams();
  params.set("direction", query.direction);
  if (query.status) params.set("status", query.status);
  params.set("page", String(query.page));
  params.set("size", String(query.size));
  params.set("sort", "createdAt,desc");
  return params.toString();
}
