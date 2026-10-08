"use client";

import { useMounted } from "../events/useMounted";

/**
 * Formats a date (or start/end range) in the visitor's local timezone.
 *
 * The server and the browser can disagree on timezone, so the first render
 * (server + hydration) uses a deterministic UTC label; after mount it switches
 * to local time. This avoids hydration mismatches without a `setState` effect.
 */
export default function LocalDateTime({
  startTime,
  endTime,
  className,
}: {
  startTime: string;
  endTime?: string;
  className?: string;
}) {
  const mounted = useMounted();
  const label = formatRange(startTime, endTime, mounted ? undefined : "UTC");

  return (
    <time dateTime={startTime} className={className}>
      {label}
    </time>
  );
}

function formatRange(startTime: string, endTime?: string, timeZone?: string): string {
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) return "";

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });

  if (!endTime) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}`;
  }

  const end = new Date(endTime);
  if (Number.isNaN(end.getTime())) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}`;
  }

  const sameDay =
    dateFormatter.format(start) === dateFormatter.format(end) &&
    start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${dateFormatter.format(end)} · ${timeFormatter.format(end)}`;
}
