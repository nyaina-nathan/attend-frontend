import Link from "next/link";
import type { EventRole, EventStatus } from "@/app/lib/types";

interface OrganizerAction {
  label: string;
  href: string;
  roles: EventRole[];
}

export default function OrganizerBar({
  eventId,
  myRole,
}: {
  eventId: string;
  myRole: EventRole;
  status: EventStatus;
}) {

  return (
    <section
      aria-label="Organizer actions"
      className="rounded-2xl border-2 border-ink bg-accent-soft p-4 shadow-brutal-sm"
    >
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
        You are an organizer ({myRole === "CREATOR" ? "creator" : "admin"})
      </p>
      <div className="flex flex-wrap items-center gap-2">
        
        <Link href={`/dashboard/events/${eventId}`} >
        <button
          className="p-3 rounded border cursor-pointer"
        >
        See the event in the dashboard
        </button>
        </Link>
      </div>
    </section>
  );
}
