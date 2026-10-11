"use client";

import Button from "../../ui/Button";
import type { EventRole } from "@/app/lib/types";
import { ArrowUpRight } from "../../ui/icons";
import { useNow } from "../useNow";

/**
 * "Edit event" link for the organizer detail page. Hidden for non-creators
 * (only the `CREATOR` may update an event) and once the event has started,
 * since events lock when they start. Resolved on the client so the time check
 * tracks the visitor's clock.
 */
export default function EditEventButton({
  eventId,
  startTime,
  role,
}: {
  eventId: string;
  startTime: string;
  role: EventRole | null;
}) {
  const now = useNow();
  const startMs = new Date(startTime).getTime();

  if (role !== "CREATOR") return<p className="text-red-800 border p-2">Only <span className="font-bold">CREATOR</span> users can edit this event</p> ;
  if (now === null || Number.isNaN(startMs) || now >= startMs) return <p className="text-red-800 border p-2">Event cannot be edited anymore once started</p> ;

  return (
    <Button
      href={`/dashboard/events/${eventId}/edit`}
      variant="outline"
      icon={<ArrowUpRight className="h-4 w-4" />}
    >
      Edit event
    </Button>
  );
}
