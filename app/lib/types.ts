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

/** Request body for `POST /events` (see docs/openapi.yaml). */
export interface EventCreateInput {
  title: string;
  description?: string;
  /** ISO UTC. */
  startTime: string;
  /** ISO UTC. */
  endTime: string;
  isPublic?: boolean;
  location?: string;
}

/** Request body for `PATCH /events/{eventId}`. Only changed fields are sent. */
export interface EventUpdateInput {
  title?: string;
  description?: string;
  location?: string;
  /** ISO UTC. */
  startTime?: string;
  /** ISO UTC. */
  endTime?: string;
  isPublic?: boolean;
}

/** Request body for `POST /events/{eventId}/tiers`. */
export interface TierCreateInput {
  tierName: string;
  price: number;
  capacity: number;
}

/** Request body for `PATCH /tiers/{tierId}`. Only changed fields are sent. */
export interface TierUpdateInput {
  tierName?: string;
  price?: number;
  capacity?: number;
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

/* ------------------------------------------------------------------- tickets */

/**
 * Normalized `GET /tickets/me` query, mirrored by the URL. `upcoming` defaults
 * to `true` (only events that have not started yet); `status` is optional so the
 * default view spans every ticket status.
 */
export interface TicketsQuery {
  status?: TicketStatus;
  upcoming: boolean;
  page: number;
  size: number;
}

/* ------------------------------------------------------------------ dashboard */

/** Rule that produced an attention item. Ignore unknown values for forward-compat. */
export type AttentionType = "NO_TIERS" | "LOW_STOCK" | "POSTPONED";

/**
 * One entry of `organizing.attention`. `tierId`/`tierName`/`remaining` are only
 * present for `LOW_STOCK`; `ticketsIssued` only for `POSTPONED`.
 */
export interface AttentionItem {
  type: AttentionType;
  eventId: string;
  eventTitle: string;
  startTime: string;
  tierId?: string;
  tierName?: string;
  remaining?: number;
  ticketsIssued?: number;
}

/** The next event the caller organizes, from `GET /users/me/dashboard`. */
export interface NextOrganizingEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
  status: EventStatus;
  myRole: EventRole;
  totalCapacity: number;
  ticketsIssued: number;
  ticketsCheckedIn: number;
}

export interface OrganizingDashboard {
  eventsTotal: number;
  eventsUpcoming: number;
  ticketsSold: number;
  revenue: number;
  nextEvent: NextOrganizingEvent | null;
  attention: AttentionItem[];
}

/** The next ticket the caller holds. */
export interface NextTicket {
  id: string;
  event: {
    id: string;
    title: string;
    startTime: string;
    location: string | null;
  };
  tier: { id: string; tierName: string };
  ticketStatus: TicketStatus;
}

export interface AttendingDashboard {
  ticketsUpcoming: number;
  nextTicket: NextTicket | null;
}

/** Aggregate payload from `GET /users/me/dashboard`. */
export interface DashboardResponse {
  organizing: OrganizingDashboard;
  attending: AttendingDashboard;
}

/* --------------------------------------------------------------- invitations */

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

/** Which side of the invitation to list, relative to the caller. */
export type InvitationDirection = "received" | "sent";

/** Narrow user reference embedded in an invitation. */
export interface UserRef {
  id: string;
  fullName: string;
  username: string;
}

/** An event creator's invitation for a user to join the event as an admin. */
export interface Invitation {
  id: string;
  event: {
    id: string;
    title: string;
    startTime: string;
    location: string | null;
  };
  sender: UserRef;
  receiver: UserRef;
  invitationStatus: InvitationStatus;
  createdAt: string;
}

/** Normalized `GET /invitations` query, mirrored by the URL. */
export interface InvitationsQuery {
  direction: InvitationDirection;
  status?: InvitationStatus;
  page: number;
  size: number;
}

/* ---------------------------------------------------------------- organizers */

/**
 * One `event_organizer` row from `GET /events/{eventId}/organizers`. `id` is the
 * row id (used to remove it); `userId` is the underlying user.
 */
export interface Organizer {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  eventRole: EventRole;
}

/* --------------------------------------------------------------------- users */

/** A user row from `GET /users` (search) — the subset the UI needs. */
export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  username: string;
}
