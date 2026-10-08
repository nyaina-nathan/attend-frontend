/** Shared API response shapes (see docs/openapi.yaml). */

export type EventStatus = "OK" | "CANCELLED" | "POSTPONED";

/** Per-event organizer role, or `null` for non-organizers/anonymous. */
export type EventRole = "CREATOR" | "ADMIN";

export type TicketStatus = "VALID" | "USED" | "CANCELLED" | "REFUNDED";

/** Sort expressions accepted by `GET /events`. */
export type EventSort = "startTime,asc" | "startTime,desc";

/** A ticket tier as returned inside `EventDetail.tiers`. */
export interface Tier {
  id: string;
  tierName: string;
  price: number;
  capacity: number;
  remaining: number;
}

/** Full event payload from `GET /events/{eventId}`. */
export interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  /** ISO UTC. */
  startTime: string;
  /** ISO UTC. */
  endTime: string;
  isPublic: boolean;
  location: string | null;
  status: EventStatus;
  /** Caller's role on this event, or `null` for anonymous/non-organizers. */
  myRole: EventRole | null;
  tiers: Tier[];
  createdAt: string;
  updatedAt: string;
}

/** Ticket returned by `POST /tiers/{tierId}/tickets`. */
export interface Ticket {
  id: string;
  event: {
    id: string;
    title: string;
    startTime: string;
    location: string | null;
  };
  tier: { id: string; tierName: string };
  pricePaid: number;
  ticketStatus: TicketStatus;
  checkedInAt: string | null;
  validUntil: string | null;
  createdAt: string;
}

export interface EventSummary {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
  status: EventStatus;
  /** Lowest tier price; `null` when the event has no tiers yet. */
  minPrice: number | null;
}

export interface Page<T> {
  content: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

/** Narrow subset of the authenticated user that the UI needs. */
export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
}

/** Normalized `GET /events` query, mirrored by the URL. */
export interface EventsQuery {
  q?: string;
  from?: string;
  to?: string;
  status: EventStatus;
  isMine: boolean;
  isPublic?: boolean;
  page: number;
  size: number;
  sort: EventSort;
}
