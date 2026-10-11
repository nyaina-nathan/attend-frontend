"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { apiRequest } from "@/app/lib/api";
import { Trash } from "../../ui/icons";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Removes one organizer from an event (`DELETE /events/{eventId}/organizers/
 * {organizerId}`). Only rendered for the event `CREATOR`; the API re-checks
 * that server-side. Confirms first, then refreshes the server data so the list
 * reflects the removal.
 */
export default function RemoveOrganizerButton({
  eventId,
  organizerId,
  name,
}: {
  eventId: string;
  organizerId: string;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await apiRequest(
        `/events/${eventId}/organizers/${organizerId}`,
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setError(
          res.status === 409
            ? "The event creator can’t be removed."
            : "We couldn’t remove this collaborator. Please try again.",
        );
        return;
      }

      setOpen(false);
      startTransition(() => router.refresh());
    } catch {
      setError("We couldn’t remove this collaborator. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        disabled={busy}
        aria-label={`Remove ${name}`}
        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-3.5 py-1.5 text-xs font-semibold text-danger shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
      >
        <Trash className="h-3.5 w-3.5" />
        Remove
      </button>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-danger bg-danger/10 px-3 py-2 text-xs font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={open}
        title="Remove collaborator?"
        description={`${name} will lose admin access to this event.`}
        confirmLabel="Remove"
        pendingLabel="Removing…"
        pending={busy}
        onConfirm={remove}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
