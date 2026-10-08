import type { EventStatus } from "@/app/lib/types";
import { Calendar, X } from "../ui/icons";
import LocalDateTime from "./LocalDateTime";

/**
 * Full-width notice for a non-OK event. Renders nothing for a healthy event.
 */
export default function StatusBanner({
  status,
  startTime,
  endTime,
}: {
  status: EventStatus;
  startTime: string;
  endTime: string;
}) {
  if (status === "OK") return null;

  const cancelled = status === "CANCELLED";

  return (
    <section
      aria-label={cancelled ? "Event cancelled" : "Event postponed"}
      className={`mb-8 flex items-start gap-4 rounded-2xl border-2 border-ink px-5 py-4 shadow-brutal-sm ${
        cancelled ? "bg-danger text-paper" : "bg-warning text-paper"
      }`}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-paper/60">
        {cancelled ? <X className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg font-bold leading-tight">
          {cancelled
            ? "This event has been cancelled."
            : "This event has been postponed."}
        </p>
        {!cancelled ? (
          <p className="text-sm text-paper/90">
            New date: <LocalDateTime startTime={startTime} endTime={endTime} />
          </p>
        ) : (
          <p className="text-sm text-paper/90">
            Ticket holders can be refunded individually by the organizer.
          </p>
        )}
      </div>
    </section>
  );
}
