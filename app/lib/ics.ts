import type { EventDetail } from "./types";

/** `2026-11-20T18:00:00.000Z` -> `20261120T180000Z`. */
function toIcsDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Escape a text value per RFC 5545. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

type IcsEvent = Pick<
  EventDetail,
  "id" | "title" | "startTime" | "endTime" | "location" | "updatedAt"
>;

/**
 * Build a downloadable `data:` URL holding a single-event `.ics` calendar.
 * `DTSTAMP` is derived from `updatedAt` so the output is deterministic.
 */
export function buildIcsDataUrl(event: IcsEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Attend//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@attend`,
    `DTSTAMP:${toIcsDate(event.updatedAt) || toIcsDate(event.startTime)}`,
    `DTSTART:${toIcsDate(event.startTime)}`,
    `DTEND:${toIcsDate(event.endTime)}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.location ? `LOCATION:${escapeText(event.location)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
