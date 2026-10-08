/** Shared API response shapes (see docs/openapi.yaml). */

export type EventStatus = "OK" | "CANCELLED" | "POSTPONED";

/** Sort expressions accepted by `GET /events`. */
export type EventSort = "startTime,asc" | "startTime,desc";

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
