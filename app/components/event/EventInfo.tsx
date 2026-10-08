import { buildIcsDataUrl } from "@/app/lib/ics";
import type { EventDetail } from "@/app/lib/types";
import { Calendar, MapPin } from "../ui/icons";
import LocalDateTime from "./LocalDateTime";

function safeFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "event"}.ics`;
}

/**
 * Long-form event content: description, schedule/venue details, and an
 * "Add to calendar" download. Map link is intentionally left as a future spot.
 */
export default function EventInfo({ event }: { event: EventDetail }) {
  const ics = buildIcsDataUrl(event);

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="event-about">
        <h2
          id="event-about"
          className="font-display text-xl font-bold tracking-tight"
        >
          About
        </h2>
        {event.description ? (
          <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink-soft">
            {event.description}
          </p>
        ) : (
          <p className="mt-3 text-base italic text-ink-soft">
            The organizer hasn’t added a description yet.
          </p>
        )}
      </section>

      <section
        aria-labelledby="event-details"
        className="rounded-2xl border-2 border-ink bg-paper p-5 shadow-brutal-sm sm:p-6"
      >
        <h2
          id="event-details"
          className="font-display text-xl font-bold tracking-tight"
        >
          Date and location
        </h2>

        <dl className="mt-4 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                Starts
              </dt>
              <dd>
                <LocalDateTime
                  startTime={event.startTime}
                  className="text-sm font-semibold"
                />
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                Ends
              </dt>
              <dd>
                <LocalDateTime
                  startTime={event.endTime}
                  className="text-sm font-semibold"
                />
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                Venue
              </dt>
              <dd className="text-sm font-semibold">
                {event.location ?? "Online"}
              </dd>
            </div>
          </div>
        </dl>

        <a
          href={ics}
          download={safeFileName(event.title)}
          className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-brand px-5 py-2.5 text-sm font-semibold shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          <Calendar className="h-4 w-4" />
          Add to calendar
        </a>

        {/* FUTURE: map link — once the schema exposes coordinates or a venue id,
            render an embedded map / "Open in maps" link here. */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-dashed border-ink/30 px-4 py-3 text-xs text-ink-soft">
          <MapPin className="h-4 w-4 shrink-0" />
          Map coming soon.
        </div>
      </section>
    </div>
  );
}
