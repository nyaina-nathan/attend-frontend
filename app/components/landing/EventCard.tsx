import Link from "next/link";
import { formatEventDate, formatEventDay, formatPrice } from "@/app/lib/format";
import type { EventSummary } from "@/app/lib/types";
import { MapPin } from "../ui/icons";

const statusStyles: Record<
  Exclude<EventSummary["status"], "OK">,
  { label: string; className: string }
> = {
  CANCELLED: { label: "Cancelled", className: "bg-danger text-paper" },
  POSTPONED: { label: "Postponed", className: "bg-warning text-paper" },
};

export default function EventCard({ event }: { event: EventSummary }) {
  const { day, month } = formatEventDay(event.startTime);
  const price = formatPrice(event.minPrice);
  const status = event.status === "OK" ? null : statusStyles[event.status];

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-full flex-col rounded-2xl border-2 border-ink bg-paper shadow-brutal transition-all duration-500 ease-brutal hover:-translate-y-1.5 hover:shadow-brutal-lg"
    >
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-ink bg-brand">
          <span className="font-display text-xl font-bold leading-none">
            {day}
          </span>
          <span className="font-mono text-[10px] tracking-wider">{month}</span>
        </div>
        <div className="min-w-0 flex-1">
          {status ? (
            <span
              className={`mb-2 inline-flex rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${status.className}`}
            >
              {status.label}
            </span>
          ) : null}
          <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight transition-colors duration-300 ease-brutal group-hover:text-accent">
            {event.title}
          </h3>
          <p className="mt-1.5 truncate text-sm text-ink-soft">
            {formatEventDate(event.startTime, event.endTime)}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t-2 border-ink px-5 py-4">
        <span className="flex min-w-0 items-center gap-2 text-sm text-ink-soft">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{event.location ?? "Online"}</span>
        </span>
        <span className="shrink-0 rounded-full border-2 border-ink bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
          {price}
        </span>
      </div>
    </Link>
  );
}
