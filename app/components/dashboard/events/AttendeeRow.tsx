import { formatPrice, initials } from "@/app/lib/format";
import type { AttendeeTicket } from "@/app/lib/types";
import LocalDateTime from "../../event/LocalDateTime";
import TicketStatusBadge from "../../tickets/TicketStatusBadge";

/**
 * One attendee of an event, built from `GET /events/{eventId}/tickets`:
 * who they are, which tier they hold, what they paid, the ticket status and
 * when they were checked in.
 */
export default function AttendeeRow({
  attendee,
  priceUnit,
}: {
  attendee: AttendeeTicket;
  priceUnit: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-brand">
        <span className="font-display text-sm font-bold leading-none">
          {initials(attendee.owner.fullName)}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-bold">
          {attendee.owner.fullName}
        </p>
        <p className="truncate font-mono text-xs text-ink-soft">
          @{attendee.owner.username}
        </p>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
        {attendee.tier.tierName}
      </span>

      <span className="font-display text-base font-bold">
        {formatPrice(attendee.pricePaid, priceUnit)}
      </span>

      <TicketStatusBadge status={attendee.ticketStatus} />

      {attendee.checkedInAt ? (
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
          Checked in <LocalDateTime startTime={attendee.checkedInAt} />
        </span>
      ) : null}
    </li>
  );
}
