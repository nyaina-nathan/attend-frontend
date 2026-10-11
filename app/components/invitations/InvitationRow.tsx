"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { apiRequest } from "@/app/lib/api";
import { formatEventDateTime, initials } from "@/app/lib/format";
import type {
  Invitation,
  InvitationDirection,
  InvitationStatus,
} from "@/app/lib/types";
import ConfirmDialog from "../dashboard/events/ConfirmDialog";
import { useMounted } from "../events/useMounted";
import { Calendar, Check, MapPin, Trash, Users, X } from "../ui/icons";
import InvitationStatusBadge from "./InvitationStatusBadge";

const actionBase =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60";

type ConfirmKind = "decline" | "delete";

/**
 * One invitation. Received invitations that are still pending can be accepted
 * or declined; sent invitations can be deleted. Mutations update the row in
 * place and then refresh the server data. The date is timezone-localized after
 * mount (UTC before) to avoid a hydration mismatch.
 */
export default function InvitationRow({
  invitation,
  direction,
}: {
  invitation: Invitation;
  direction: InvitationDirection;
}) {
  const router = useRouter();
  const mounted = useMounted();
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const isReceived = direction === "received";
  const isPending = invitation.invitationStatus === "PENDING";
  const counterpart = isReceived ? invitation.sender : invitation.receiver;

  const timeZone = mounted ? undefined : "UTC";
  const date = formatEventDateTime(invitation.event.startTime, timeZone);

  async function respond(invitationStatus: InvitationStatus) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiRequest(`/invitations/${invitation.id}`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationStatus }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setError("We couldn’t update this invitation. Please try again.");
        return;
      }

      setConfirm(null);
      startTransition(() => router.refresh());
    } catch {
      setError("We couldn’t update this invitation. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiRequest(`/invitations/${invitation.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setError("We couldn’t delete this invitation. Please try again.");
        return;
      }

      setConfirm(null);
      startTransition(() => router.refresh());
    } catch {
      setError("We couldn’t delete this invitation. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li>
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-accent-soft sm:h-16 sm:w-16">
            <span className="font-display text-lg font-bold leading-none">
              {initials(counterpart.fullName)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <InvitationStatusBadge status={invitation.invitationStatus} />
            <Link
              href={`/events/${invitation.event.id}`}
              className="mt-1.5 block line-clamp-2 font-display text-lg font-bold leading-tight transition-colors duration-300 ease-brutal hover:text-accent"
            >
              {invitation.event.title}
            </Link>
            <div className="mt-1.5 flex flex-col gap-1 text-sm text-ink-soft">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <time dateTime={invitation.event.startTime}>{date}</time>
              </span>
              {invitation.event.location ? (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{invitation.event.location}</span>
                </span>
              ) : null}
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {isReceived
                    ? `Invited by ${invitation.sender.fullName}`
                    : `Invited ${invitation.receiver.fullName}`}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:flex-col sm:items-stretch sm:gap-2">
          {isReceived && isPending ? (
            <>
              <button
                type="button"
                onClick={() => respond("ACCEPTED")}
                disabled={busy}
                className={`${actionBase} bg-accent text-paper`}
              >
                <Check className="h-4 w-4" />
                {busy ? "Accepting…" : "Accept"}
              </button>
              <button
                type="button"
                onClick={() => setConfirm("decline")}
                disabled={busy}
                className={`${actionBase} bg-paper`}
              >
                <X className="h-4 w-4" />
                Decline
              </button>
            </>
          ) : null}

          {!isReceived ? (
            <button
              type="button"
              onClick={() => setConfirm("delete")}
              disabled={busy}
              className={`${actionBase} bg-paper text-danger`}
            >
              <Trash className="h-4 w-4" />
              Delete
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-2 rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={confirm === "decline"}
        title="Decline invitation?"
        description={`You won’t be added as an organizer of “${invitation.event.title}”. This can’t be undone.`}
        confirmLabel="Decline"
        pendingLabel="Declining…"
        pending={busy}
        onConfirm={() => respond("DECLINED")}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === "delete"}
        title="Delete invitation?"
        description={`The invitation for ${invitation.receiver.fullName} will be removed.`}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        pending={busy}
        onConfirm={remove}
        onCancel={() => setConfirm(null)}
      />
    </li>
  );
}
