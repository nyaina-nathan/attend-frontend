"use client";

import { useState } from "react";
import { formatEventDateTime } from "@/app/lib/format";
import type { NextTicket } from "@/app/lib/types";
import { Calendar, MapPin, QrCode, Ticket as TicketIcon } from "../ui/icons";
import { useMounted } from "../events/useMounted";
import TicketQrDialog from "../tickets/TicketQrDialog";
import Button from "../ui/Button";

const eyebrow =
  "font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft";

/**
 * The next ticket the caller holds, with a large phone-friendly QR view. The
 * date is timezone-localized after mount to avoid hydration mismatches.
 */
export default function NextTicketCard({
  ticket,
}: {
  ticket: NextTicket | null;
}) {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  if (!ticket) {
    return (
      <section className="flex h-full flex-col justify-between rounded-3xl border-2 border-dashed border-ink/40 bg-paper p-6">
        <div>
          <p className={eyebrow}>Next up · Attending</p>
          <p className="mt-3 font-display text-xl font-bold">
            No upcoming tickets
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Find something worth going to.
          </p>
        </div>
        <Button
          href="/events"
          variant="accent"
          className="mt-5 self-start"
          icon={<TicketIcon className="h-4 w-4" />}
        >
          Browse events
        </Button>
      </section>
    );
  }

  const date = formatEventDateTime(
    ticket.event.startTime,
    mounted ? undefined : "UTC",
  );
  const code = `ATT-${ticket.id.slice(0, 8).toUpperCase()}`;

  return (
    <section
      aria-labelledby="next-ticket-title"
      className="flex h-full flex-col rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal sm:p-6"
    >
      <p className={eyebrow}>Next up · Attending</p>

      <h2
        id="next-ticket-title"
        className="mt-3 font-display text-2xl font-bold leading-tight"
      >
        {ticket.event.title}
      </h2>

      <div className="mt-3 flex flex-col gap-1.5 text-sm text-ink-soft">
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <time dateTime={ticket.event.startTime}>{date}</time>
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{ticket.event.location ?? "Online"}</span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
          <TicketIcon className="h-3.5 w-3.5" />
          {ticket.tier.tierName}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-5">
        <Button
          onClick={() => setOpen(true)}
          icon={<QrCode className="h-4 w-4" />}
        >
          Show QR
        </Button>
        <Button href="/dashboard/tickets" variant="outline">
          My tickets
        </Button>
      </div>

      <TicketQrDialog
        open={open}
        onClose={() => setOpen(false)}
        title={ticket.event.title}
        date={date}
        venue={ticket.event.location ?? "Online"}
        tier={ticket.tier.tierName}
        code={code}
      />
    </section>
  );
}
