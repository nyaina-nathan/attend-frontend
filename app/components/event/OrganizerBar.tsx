"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { apiRequest } from "@/app/lib/api";
import type { EventDetail, EventRole, EventStatus } from "@/app/lib/types";
import { Chart, Layers, QrCode, Shield, Users, X } from "../ui/icons";

interface OrganizerAction {
  label: string;
  href: string;
  roles: EventRole[];
}

function actionsFor(eventId: string): OrganizerAction[] {
  return [
    { label: "Edit event", href: `/events/${eventId}/edit`, roles: ["CREATOR"] },
    { label: "Manage tiers", href: `/events/${eventId}/tiers`, roles: ["CREATOR", "ADMIN"] },
    { label: "Attendees", href: `/events/${eventId}/attendees`, roles: ["CREATOR", "ADMIN"] },
    { label: "Stats", href: `/events/${eventId}/stats`, roles: ["CREATOR", "ADMIN"] },
    { label: "Scan tickets", href: `/events/${eventId}/scan`, roles: ["CREATOR", "ADMIN"] },
    { label: "Team", href: `/events/${eventId}/team`, roles: ["CREATOR", "ADMIN"] },
  ];
}

const iconFor: Record<string, ReactNode> = {
  "Edit event": <Layers className="h-4 w-4" />,
  "Manage tiers": <Layers className="h-4 w-4" />,
  Attendees: <Users className="h-4 w-4" />,
  Stats: <Chart className="h-4 w-4" />,
  "Scan tickets": <QrCode className="h-4 w-4" />,
  Team: <Shield className="h-4 w-4" />,
};

/**
 * Organizer-only action strip. Purely UX: the backend enforces permissions, so
 * links are shown by role but never trusted for authorization.
 */
export default function OrganizerBar({
  eventId,
  myRole,
  status,
}: {
  eventId: string;
  myRole: EventRole;
  status: EventStatus;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const actions = actionsFor(eventId).filter((action) =>
    action.roles.includes(myRole),
  );
  const canCancel = myRole === "CREATOR" && status !== "CANCELLED";

  useEffect(() => {
    if (dialogOpen) dialogRef.current?.focus();
  }, [dialogOpen]);

  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) setDialogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogOpen, pending]);

  async function cancelEvent() {
    setPending(true);
    setError(null);
    try {
      const res = await apiRequest<EventDetail>(`/events/${eventId}/cancel`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        setDialogOpen(false);
        router.refresh();
        return;
      }
      setError("We couldn’t cancel this event. Please try again.");
    } catch {
      setError("We couldn’t cancel this event. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      aria-label="Organizer actions"
      className="rounded-2xl border-2 border-ink bg-accent-soft p-4 shadow-brutal-sm"
    >
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
        You’re an organizer ({myRole === "CREATOR" ? "creator" : "admin"})
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            {iconFor[action.label]}
            {action.label}
          </Link>
        ))}

        {canCancel ? (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-danger px-4 py-2 text-xs font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <X className="h-4 w-4" />
            Cancel event
          </button>
        ) : null}
      </div>

      {dialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
          role="presentation"
          onClick={() => {
            if (!pending) setDialogOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-event-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border-2 border-ink bg-paper p-6 shadow-brutal-xl focus:outline-none"
          >
            <h2
              id="cancel-event-title"
              className="font-display text-xl font-bold"
            >
              Cancel this event?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              The event will be marked as cancelled and check-in will stop
              working. Tickets are left as-is, so you can refund them
              individually.
            </p>

            {error ? (
              <p role="alert" className="mt-3 text-sm font-semibold text-danger">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={pending}
                onClick={() => setDialogOpen(false)}
                className="rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
              >
                Keep event
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={cancelEvent}
                className="rounded-full border-2 border-ink bg-danger px-5 py-2.5 text-sm font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
              >
                {pending ? "Cancelling…" : "Yes, cancel event"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
