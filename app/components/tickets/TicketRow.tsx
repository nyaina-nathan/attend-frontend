"use client";

import Link from "next/link";
import { useState } from "react";
import { formatEventDateTime, formatEventDay, formatMoney } from "@/app/lib/format";
import type { Ticket } from "@/app/lib/types";
import { useMounted } from "../events/useMounted";
import { Calendar, MapPin, QrCode, Ticket as TicketIcon } from "../ui/icons";
import TicketQrDialog from "./TicketQrDialog";
import TicketStatusBadge from "./TicketStatusBadge";

/**
 * One ticket in the list. Client-side so it can own the QR overlay; the date
 * block is timezone-localized after mount (UTC before) to avoid a hydration
 * mismatch.
 */
export default function TicketRow({ ticket }: { ticket: Ticket }) {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  const timeZone = mounted ? undefined : "UTC";
  const { day, month } = formatEventDay(ticket.event.startTime, timeZone);
  const date = formatEventDateTime(ticket.event.startTime, timeZone);
  const code = `ATT-${ticket.id.slice(0, 8).toUpperCase()}`;

  return (
    <li>
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-ink bg-brand sm:h-16 sm:w-16">
            <span className="font-display text-xl font-bold leading-none">
              {day}
            </span>
            <span className="font-mono text-[10px] tracking-wider">{month}</span>
          </div>

          <div className="min-w-0 flex-1">
            <TicketStatusBadge status={ticket.ticketStatus} />
            <Link
              href={`/events/${ticket.event.id}`}
              className="mt-1.5 block line-clamp-2 font-display text-lg font-bold leading-tight transition-colors duration-300 ease-brutal hover:text-accent"
            >
              {ticket.event.title}
            </Link>
            <div className="mt-1.5 flex flex-col gap-1 text-sm text-ink-soft">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <time dateTime={ticket.event.startTime}>{date}</time>
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{ticket.event.location ?? "Online"}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
            <TicketIcon className="h-3.5 w-3.5" />
            {ticket.tier.tierName}
          </span>
          <span className="font-display text-lg font-bold">
            {ticket.pricePaid > 0 ? formatMoney(ticket.pricePaid) : "Free"}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-brand px-4 py-2 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <QrCode className="h-4 w-4" />
            Show QR
          </button>
        </div>
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
    </li>
  );
}
