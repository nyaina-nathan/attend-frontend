import Link from "next/link";
import { getUpcomingEvents } from "@/app/lib/events";
import Reveal from "../ui/Reveal";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import { ArrowRight, Calendar } from "../ui/icons";
import EventCard from "./EventCard";

export default async function UpcomingEvents() {
  const events = await getUpcomingEvents(6);

  return (
    <Section id="events" tone="surface">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Upcoming"
          title="Events happening soon"
          description="Fresh from the community. Grab a tier before it sells out."
        />
        <Link
          href="/events"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          See all events
          <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-brutal group-hover:translate-x-0.5" />
        </Link>
      </div>

      {events.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <Reveal key={event.id} delay={index * 70}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal className="mt-12">
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-ink/40 bg-paper px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand">
              <Calendar className="h-7 w-7" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-display text-xl font-bold">
                No events yet
              </p>
              <p className="text-sm text-ink-soft">
                Be the first to put something on the calendar.
              </p>
            </div>
            <Link
              href="/register"
              className="mt-2 rounded-full border-2 border-ink bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Create the first event
            </Link>
          </div>
        </Reveal>
      )}
    </Section>
  );
}
