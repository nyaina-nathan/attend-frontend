import type { EventSummary } from "@/app/lib/types";
import Reveal from "../ui/Reveal";
import EventCard from "../landing/EventCard";

export default function EventGrid({ events }: { events: EventSummary[] }) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {events.map((event, index) => (
        <Reveal key={event.id} delay={Math.min(index, 8) * 60}>
          <EventCard event={event} />
        </Reveal>
      ))}
    </div>
  );
}
