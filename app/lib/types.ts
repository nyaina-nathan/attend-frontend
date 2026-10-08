/** Shared API response shapes (see docs/openapi.yaml). */

export type EventStatus = "OK" | "CANCELLED" | "POSTPONED";

export interface EventSummary {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
  status: EventStatus;
  minPrice: number;
}

export interface Page<T> {
  content: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}
