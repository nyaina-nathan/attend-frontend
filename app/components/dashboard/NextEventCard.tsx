"use client";

import { formatCount, formatCountdown } from "@/app/lib/format";
import type { NextOrganizingEvent } from "@/app/lib/types";
import LocalDateTime from "../event/LocalDateTime";
import Button from "../ui/Button";
import { ArrowUpRight, Calendar, MapPin, QrCode } from "../ui/icons";
import { useNow } from "./useNow";
import { RoleBadge, StatusBadge } from "./Badges";

const eyebrow =
  "font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft";

function ProgressBar({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="font-mono text-ink-soft">
          {formatCount(value)} / {formatCount(total)}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border-2 border-ink bg-paper">
        <div
          className="h-full bg-brand"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={label}
        />
      </div>
    </div>
  );
}

/**
 * The next event the caller organizes. Client-side so the countdown and the
 * "started" check resolve against the visitor's clock after mount.
 */
export default function NextEventCard({
  event,
}: {
  event: NextOrganizingEvent | null;
}) {
  const now = useNow();

  if (!event) {
    return (
      <section className="flex h-full flex-col justify-between rounded-3xl border-2 border-dashed border-ink/40 bg-paper p-6">
        <div>
          <p className={eyebrow}>Next up · Organizing</p>
          <p className="mt-3 font-display text-xl font-bold">
            You’re not organizing anything yet
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Create your first event and start selling tickets.
          </p>
        </div>
        <Button
          href="/dashboard/events?create=1"
          variant="accent"
          className="mt-5 self-start"
          icon={<ArrowUpRight className="h-4 w-4" />}
        >
          Create event
        </Button>
      </section>
    );
  }

  const countdown =
    now === null ? null : formatCountdown(event.startTime, event.endTime, now);
  const started = now !== null && now >= new Date(event.startTime).getTime();
  const showCheckIn = started || event.ticketsCheckedIn > 0;

  return (
    <section
      aria-labelledby="next-event-title"
      className="flex h-full flex-col rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <p className={eyebrow}>Next up · Organizing</p>
        <RoleBadge role={event.myRole} />
      </div>

      <h2
        id="next-event-title"
        className="mt-3 font-display text-2xl font-bold leading-tight"
      >
        {event.title}
      </h2>

      <div className="mt-3 flex flex-col gap-1.5 text-sm text-ink-soft">
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <LocalDateTime startTime={event.startTime} endTime={event.endTime} />
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{event.location ?? "Online"}</span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {countdown ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-brand px-3 py-1 text-xs font-bold">
            {countdown}
          </span>
        ) : null}
        <StatusBadge status={event.status} />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <ProgressBar
          value={event.ticketsIssued}
          total={event.totalCapacity}
          label="Tickets issued"
        />
        {showCheckIn ? (
          <ProgressBar
            value={event.ticketsCheckedIn}
            total={event.ticketsIssued}
            label="Checked in"
          />
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 pt-1">
        <Button
          href={`/dashboard/events/${event.id}`}
          icon={<ArrowUpRight className="h-4 w-4" />}
        >
          Manage
        </Button>
        <Button
          href={`/dashboard/events/${event.id}/scan`}
          variant="outline"
          icon={<QrCode className="h-4 w-4" />}
        >
          Scan
        </Button>
      </div>
    </section>
  );
}
