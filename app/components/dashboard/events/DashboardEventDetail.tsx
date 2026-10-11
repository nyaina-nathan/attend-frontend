import Link from "next/link";
import type { EventDetail } from "@/app/lib/types";
import LocalDateTime from "../../event/LocalDateTime";
import { ArrowRight, Calendar, Globe, Lock, MapPin } from "../../ui/icons";
import { RoleBadge, StatusBadge } from "../Badges";
import DashboardEventTiers from "./DashboardEventTiers";

const eyebrow =
  "font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft";

/**
 * Read-only organizer view of one event, built from `GET /events/{eventId}`:
 * masthead, about, ticket tiers and the raw metadata (visibility, role,
 * timestamps). Management actions land here in later steps.
 */
export default function DashboardEventDetail({ event }: { event: EventDetail }) {
  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/dashboard/events"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink-soft transition-colors duration-300 ease-brutal hover:text-accent"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        Back to my events
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {event.myRole ? <RoleBadge role={event.myRole} /> : null}
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
            {event.isPublic ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            {event.isPublic ? "Public" : "Private"}
          </span>
          <StatusBadge status={event.status} />
        </div>

        <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
          {event.title}
        </h1>

        <div className="flex flex-col gap-1.5 text-base text-ink-soft">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 shrink-0" />
            <LocalDateTime startTime={event.startTime} endTime={event.endTime} />
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5 shrink-0" />
            <span>{event.location ?? "Online"}</span>
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
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
                No description yet.
              </p>
            )}
          </section>

          <DashboardEventTiers tiers={event.tiers ?? []} />
        </div>

        <aside className="lg:col-span-1">
          <section
            aria-labelledby="event-meta"
            className="rounded-2xl border-2 border-ink bg-paper p-5 shadow-brutal-sm"
          >
            <h2
              id="event-meta"
              className="font-display text-xl font-bold tracking-tight"
            >
              Details
            </h2>

            <dl className="mt-4 flex flex-col gap-4">
              <div>
                <dt className={eyebrow}>Visibility</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {event.isPublic ? "Public" : "Private"}
                </dd>
              </div>

              {event.myRole ? (
                <div>
                  <dt className={eyebrow}>Your role</dt>
                  <dd className="mt-1">
                    <RoleBadge role={event.myRole} />
                  </dd>
                </div>
              ) : null}

              <div>
                <dt className={eyebrow}>Created</dt>
                <dd className="mt-1 text-sm font-semibold">
                  <LocalDateTime startTime={event.createdAt} />
                </dd>
              </div>

              <div>
                <dt className={eyebrow}>Last updated</dt>
                <dd className="mt-1 text-sm font-semibold">
                  <LocalDateTime startTime={event.updatedAt} />
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
