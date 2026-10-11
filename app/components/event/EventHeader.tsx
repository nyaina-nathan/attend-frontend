import type { EventDetail } from "@/app/lib/types";
import { Lock, MapPin } from "../ui/icons";
import LocalDateTime from "./LocalDateTime";

/** Deterministic banner gradients, picked from the event id. */
const GRADIENTS: [string, string][] = [
  ["#fdc800", "#432dd7"],
  ["#432dd7", "#16a34a"],
  ["#fdc800", "#16a34a"],
  ["#432dd7", "#56637a"],
  ["#1c293c", "#432dd7"],
  ["#fdc800", "#e5e0ff"],
];

function gradientFor(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

/**
 * Event masthead: generated banner, title, local date range, location and a
 * public/private badge. No image field exists in the schema.
 */
export default function EventHeader({ event }: { event: EventDetail }) {
  const [from, to] = gradientFor(event.id);

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {!event.isPublic ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
              <Lock className="h-3.5 w-3.5" />
              Private
            </span>
          ) : null}
        </div>

        <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
          {event.title}
        </h1>

        <LocalDateTime
          startTime={event.startTime}
          endTime={event.endTime}
          className="font-display text-base font-semibold text-ink-soft sm:text-lg"
        />

        {event.location ? (
          <p className="flex items-center gap-2 text-base text-ink-soft">
            <MapPin className="h-5 w-5 shrink-0" />
            <span>{event.location}</span>
          </p>
        ) : null}
      </div>
    </header>
  );
}
