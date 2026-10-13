import { Calendar } from "../ui/icons";
import LocalDateTime from "./LocalDateTime";

/**
 * Replaces the ticket panel once an event's end time has passed. Reuses the
 * same shell as `TicketPanel` so the page layout is unchanged, but offers no
 * way to add tickets to the cart.
 */
export default function EventEndedNotice({ endTime }: { endTime: string }) {
  return (
    <aside
      id="tickets"
      aria-label="Tickets"
      className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start"
    >
      <div className="rounded-3xl border-2 border-ink bg-surface p-5 shadow-brutal sm:p-6">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Tickets
        </h2>

        <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-ink/30 px-4 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-paper">
            <Calendar className="h-5 w-5 text-ink-soft" />
          </span>
          <p className="font-display text-lg font-bold">Event already ended</p>
          <p className="text-sm text-ink-soft">
            Ticket sales are closed because this event has already finished.
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            Ended <LocalDateTime startTime={endTime} />
          </p>
        </div>
      </div>
    </aside>
  );
}
