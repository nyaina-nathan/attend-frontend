import { redirect } from "next/navigation";
import { getEventOrganizers } from "@/app/lib/organizers";
import type { EventRole } from "@/app/lib/types";
import CollaboratorsCard from "./CollaboratorsCard";
import CollaboratorsError from "./CollaboratorsError";

/**
 * Streams an event's organizer list. Runs behind its own `<Suspense>` boundary
 * so the rest of the detail page renders first. A `401` means the session is
 * gone, so redirect to login; a `403`/`404` (not an organizer / unknown event)
 * renders nothing, since the page already guards those cases.
 */
export default async function CollaboratorsSection({
  eventId,
  myRole,
}: {
  eventId: string;
  myRole: EventRole | null;
}) {
  const result = await getEventOrganizers(eventId);

  if (!result.ok) {
    if (result.status === 401) redirect("/login");
    if (result.status === 403 || result.status === 404) return null;
    return <CollaboratorsError />;
  }

  return (
    <CollaboratorsCard
      eventId={eventId}
      organizers={result.data}
      myRole={myRole}
    />
  );
}
