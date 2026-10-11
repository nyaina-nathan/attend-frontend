"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { apiRequest } from "@/app/lib/api";
import {
  validateEventDraft,
  type EventDraft,
  type EventErrors,
} from "@/app/lib/create-event";
import {
  buildEventUpdateInput,
  eventDraftFromDetail,
} from "@/app/lib/edit-event";
import type { EventDetail } from "@/app/lib/types";
import LocalDateTime from "../../event/LocalDateTime";
import Button from "../../ui/Button";
import { ArrowRight, ArrowUpRight } from "../../ui/icons";
import { useMounted } from "../../events/useMounted";
import { useNow } from "../useNow";
import ConfirmDialog from "./ConfirmDialog";
import EventEditSkeleton from "./EventEditSkeleton";
import EventFields from "./EventFields";

function sameDraft(a: EventDraft, b: EventDraft): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.location === b.location &&
    a.isPublic === b.isPublic &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime
  );
}

function saveMessage(errorCode: string | undefined, status: number): string {
  if (status === 401) return "Your session expired. Please log in again.";
  if (errorCode === "VALIDATION_ERROR" || status === 400) {
    return "Please check the details and try again.";
  }
  if (status === 403) return "Only the event creator can edit this event.";
  return "We couldn’t save your changes. Please try again.";
}

function deleteMessage(errorCode: string | undefined, status: number): string {
  if (status === 401) return "Your session expired. Please log in again.";
  if (errorCode === "EVENT_HAS_TICKETS" || status === 409) {
    return "This event already has tickets, so it can’t be deleted. Cancel it instead.";
  }
  if (status === 403) return "Only the event creator can delete this event.";
  return "We couldn’t delete your event. Please try again.";
}

const secondaryAction =
  "rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Editable view of one event the caller organizes. Keeps the fetched values as
 * `initial` so Reset can restore them; Save PATCHes only the changed fields.
 *
 * The form is rendered after mount so `datetime-local` inputs use the visitor's
 * timezone (server and client can otherwise disagree, breaking hydration).
 * Events lock automatically once their start time has passed.
 */
export default function EventEditForm({ event }: { event: EventDetail }) {
  const router = useRouter();
  const mounted = useMounted();
  const now = useNow();

  const [initial] = useState<EventDraft>(() => eventDraftFromDetail(event));
  const [draft, setDraft] = useState<EventDraft>(() => eventDraftFromDetail(event));
  const [errors, setErrors] = useState<EventErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dirty = useMemo(() => !sameDraft(draft, initial), [draft, initial]);

  const detailHref = `/dashboard/events/${event.id}`;

  if (!mounted) return <EventEditSkeleton />;

  const startMs = new Date(event.startTime).getTime();
  const started = now !== null && !Number.isNaN(startMs) && now >= startMs;
  const isCreator = event.myRole === "CREATOR";

  if (!isCreator || started) {
    const reason = !isCreator
      ? {
          eyebrow: "Creator only",
          title: "Only the event creator can edit this event",
          body: (
            <>
              You’re an organizer of{" "}
              <span className="font-semibold">{event.title}</span>, but only its
              creator can change these details.
            </>
          ),
        }
      : {
          eyebrow: "Locked",
          title: "This event can no longer be edited",
          body: (
            <>
              <span className="font-semibold">{event.title}</span> started on{" "}
              <LocalDateTime startTime={event.startTime} />. Events lock
              automatically once they start.
            </>
          ),
        };

    return (
      <div className="flex flex-col gap-8">
        <BackLink href={detailHref} />

        <div className="flex flex-col items-start gap-4 rounded-3xl border-2 border-ink bg-paper p-6 shadow-brutal-sm sm:p-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            {reason.eyebrow}
          </span>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            {reason.title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-ink-soft">
            {reason.body}
          </p>
          <Button
            href={detailHref}
            className="mt-2"
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            Back to event
          </Button>
        </div>
      </div>
    );
  }

  const updateDraft = (patch: Partial<EventDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  function reset() {
    setDraft(initial);
    setErrors({});
    setSubmitError(null);
  }

  function cancel() {
    router.push(detailHref);
  }

  async function save() {
    if (saving || deleting) return;

    const nextErrors = validateEventDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body = buildEventUpdateInput(initial, draft);
    if (Object.keys(body).length === 0) {
      router.push(detailHref);
      return;
    }

    setSubmitError(null);
    setSaving(true);
    try {
      const res = await apiRequest<EventDetail>(`/events/${event.id}`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.data) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setSubmitError(saveMessage(res.errorCode, res.status));
        return;
      }

      router.push(detailHref);
    } catch {
      setSubmitError("We couldn’t save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    if (deleting || saving) return;
    setSubmitError(null);
    setDeleting(true);
    try {
      const res = await apiRequest(`/events/${event.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        setConfirmOpen(false);
        router.push("/dashboard/events");
        router.refresh();
        return;
      }

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      setConfirmOpen(false);
      setSubmitError(deleteMessage(res.errorCode, res.status));
    } catch {
      setConfirmOpen(false);
      setSubmitError("We couldn’t delete your event. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <BackLink href={detailHref} />

      <header className="flex flex-col gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          Edit event
        </span>
        <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl">
          {event.title}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-soft">
          Update the details below. Changes apply as soon as you save.
        </p>
      </header>

      {submitError ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
        >
          {submitError}
        </p>
      ) : null}

      <section
        aria-label="Event details"
        className="rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-sm sm:p-6"
      >
        <EventFields draft={draft} errors={errors} onChange={updateDraft} />
      </section>

      <div className="flex flex-col gap-4 border-t-2 border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={saving || deleting}
          className="self-start rounded-full border-2 border-danger px-5 py-2.5 text-sm font-semibold text-danger transition-all duration-500 ease-brutal hover:bg-danger hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete event
        </button>

        <div className="flex flex-wrap gap-3 sm:justify-end">
          <button
            type="button"
            onClick={reset}
            disabled={!dirty || saving || deleting}
            className={secondaryAction}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving || deleting}
            className={secondaryAction}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving || deleting}
            className="rounded-full border-2 border-ink bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this event?"
        description={`“${event.title}” will be permanently deleted. This can’t be undone.`}
        confirmLabel="Delete event"
        pendingLabel="Deleting…"
        pending={deleting}
        onConfirm={destroy}
        onCancel={() => {
          if (!deleting) setConfirmOpen(false);
        }}
      />
    </div>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink-soft transition-colors duration-300 ease-brutal hover:text-accent"
    >
      <ArrowRight className="h-4 w-4 rotate-180" />
      Back to event
    </Link>
  );
}
