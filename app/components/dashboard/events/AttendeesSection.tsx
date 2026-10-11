"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchEventAttendees } from "@/app/lib/attendees";
import { formatCount } from "@/app/lib/format";
import type { AttendeeTicket, Page } from "@/app/lib/types";
import AttendeeRow from "./AttendeeRow";
import AttendeesError from "./AttendeesError";
import AttendeesSkeleton from "./AttendeesSkeleton";

const pagerButton =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border-2 border-ink bg-paper px-4 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

/**
 * Organizer view of an event's attendees (`GET /events/{eventId}/tickets`).
 * Loaded from the browser with 20 per page and Previous/Next navigation, so
 * paging doesn't re-stream the rest of the event page. The section handles its
 * own loading, empty and error states.
 */
export default function AttendeesSection({ eventId }: { eventId: string }) {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<AttendeeTicket> | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetchEventAttendees(eventId, page, controller.signal);
        if (controller.signal.aborted) return;

        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok || !res.data) {
          setFailed(true);
          return;
        }
        setData(res.data);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [eventId, page, reloadKey, router]);

  const attendees = data?.content ?? [];
  const total = data?.totalElements ?? attendees.length;
  const totalPages = data?.totalPages ?? 0;
  const current = data?.page ?? page;

  function goToPage(next: number) {
    setLoading(true);
    setPage(next);
  }

  function retry() {
    setLoading(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  }

  return (
    <section aria-labelledby="event-attendees">
      <div className="flex flex-wrap items-center gap-3">
        <h2
          id="event-attendees"
          className="font-display text-xl font-bold tracking-tight"
        >
          Attendees
        </h2>
        {data ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            {formatCount(total)} {total === 1 ? "attendee" : "attendees"}
          </span>
        ) : null}
      </div>

      {failed ? (
        <div className="mt-3">
          <AttendeesError onRetry={retry} pending={loading} />
        </div>
      ) : loading && !data ? (
        <div className="mt-3">
          <AttendeesSkeleton />
        </div>
      ) : attendees.length === 0 ? (
        <p className="mt-3 rounded-2xl border-2 border-dashed border-ink/40 px-4 py-6 text-center text-sm text-ink-soft">
          No attendees yet.
        </p>
      ) : (
        <>
          <ul
            className={`mt-3 flex flex-col gap-3 transition-opacity duration-300 ${
              loading ? "opacity-60" : "opacity-100"
            }`}
          >
            {attendees.map((attendee) => (
              <AttendeeRow key={attendee.id} attendee={attendee} />
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav
              aria-label="Attendees pagination"
              className="mt-6 flex items-center justify-center gap-3"
            >
              <button
                type="button"
                onClick={() => goToPage(current - 1)}
                disabled={loading || current <= 0}
                className={pagerButton}
              >
                Previous
              </button>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                Page {current + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(current + 1)}
                disabled={loading || current >= totalPages - 1}
                className={pagerButton}
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
