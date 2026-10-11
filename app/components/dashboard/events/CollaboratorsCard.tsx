import { initials } from "@/app/lib/format";
import type { EventRole, Organizer } from "@/app/lib/types";
import { RoleBadge } from "../Badges";
import AddCollaboratorButton from "./AddCollaboratorButton";
import RemoveOrganizerButton from "./RemoveOrganizerButton";

/**
 * Read-only list of an event's organizers, built from
 * `GET /events/{eventId}/organizers`. Visible to every organizer; the Remove
 * and Add actions are shown only to the event `CREATOR`, and Remove is never
 * offered on the `CREATOR`'s own row (the API rejects that with `409`).
 */
export default function CollaboratorsCard({
  eventId,
  organizers,
  myRole,
}: {
  eventId: string;
  organizers: Organizer[];
  myRole: EventRole | null;
}) {
  const isCreator = myRole === "CREATOR";
  const excludeUserIds = organizers.map((organizer) => organizer.userId);

  return (
    <section aria-labelledby="event-collaborators">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2
            id="event-collaborators"
            className="font-display text-xl font-bold tracking-tight"
          >
            Collaborators
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            {organizers.length} {organizers.length === 1 ? "person" : "people"}
          </span>
        </div>
        {isCreator ? (
          <AddCollaboratorButton
            eventId={eventId}
            excludeUserIds={excludeUserIds}
          />
        ) : null}
      </div>

      {organizers.length === 0 ? (
        <p className="mt-3 rounded-2xl border-2 border-dashed border-ink/40 px-4 py-6 text-center text-sm text-ink-soft">
          No collaborators yet.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {organizers.map((organizer) => {
            const isCreatorRow = organizer.eventRole === "CREATOR";

            return (
              <li
                key={organizer.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-accent-soft">
                  <span className="font-display text-sm font-bold leading-none">
                    {initials(organizer.fullName)}
                  </span>
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-bold">
                    {organizer.fullName}
                  </p>
                  <p className="truncate font-mono text-xs text-ink-soft">
                    @{organizer.username}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <RoleBadge role={organizer.eventRole} />
                  {isCreator && !isCreatorRow ? (
                    <RemoveOrganizerButton
                      eventId={eventId}
                      organizerId={organizer.id}
                      name={organizer.fullName}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
