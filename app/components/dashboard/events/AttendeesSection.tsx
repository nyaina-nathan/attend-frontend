"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchEventAttendees } from "@/app/lib/attendees";
import { formatCount } from "@/app/lib/format";
import type { AttendeeTicket, Page, TicketStatus } from "@/app/lib/types";
import AttendeeRow from "./AttendeeRow";
import AttendeesError from "./AttendeesError";
import AttendeesFilterBar from "./AttendeesFilterBar";
import AttendeesSkeleton from "./AttendeesSkeleton";

/** Debounce: wait for the visitor to stop typing before searching. */
const DEBOUNCE_MS = 350;

const pagerButton =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border-2 border-ink bg-paper px-4 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

/**
 * Organizer view of an event's attendees (`GET /events/{eventId}/tickets`).
 * Loaded from the browser with 20 per page and Previous/Next navigation, so
 * paging doesn't re-stream the rest of the event page. Supports the endpoint's
 * `q`, `status` and `tierId` filters; any filter change resets to the first
 * page. The section handles its own loading, empty and error states.
 */
export default function AttendeesSection({
  eventId,
  tiers,
  priceUnit,
}: {
  eventId: string;
  tiers: { id: string; tierName: string }[];
  priceUnit: string;
}) {
  const router = useRouter();

  const [term, setTerm] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TicketStatus | undefined>();
  const [tierId, setTierId] = useState("");

  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<AttendeeTicket> | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce the search box into `q`, then re-query from the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(term.trim());
      setPage(0);
      setLoading(true);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetchEventAttendees(
          eventId,
          { page, status, tierId: tierId || undefined, q: q || undefined },
          controller.signal,
        );
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
  }, [eventId, page, q, status, tierId, reloadKey, router]);

  const attendees = data?.content ?? [];
  const total = data?.totalElements ?? attendees.length;
  const totalPages = data?.totalPages ?? 0;
  const current = data?.page ?? page;

  const hasInputFilters = Boolean(term.trim() || status || tierId);
  const hasAppliedFilters = Boolean(q || status || tierId);

  function goToPage(next: number) {
    setLoading(true);
    setPage(next);
  }

  function changeStatus(next?: TicketStatus) {
    setStatus(next);
    setPage(0);
    setLoading(true);
  }

  function changeTier(next: string) {
    setTierId(next);
    setPage(0);
    setLoading(true);
  }

  function clearFilters() {
    setTerm("");
    setQ("");
    setStatus(undefined);
    setTierId("");
    setPage(0);
    setFailed(false);
    setLoading(true);
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

      <div className="mt-3">
        <AttendeesFilterBar
          term={term}
          status={status}
          tierId={tierId}
          tiers={tiers}
          hasFilters={hasInputFilters}
          onTermChange={setTerm}
          onStatusChange={changeStatus}
          onTierChange={changeTier}
          onClear={clearFilters}
        />
      </div>

      <div className="mt-4">
        {failed ? (
          <AttendeesError onRetry={retry} pending={loading} />
        ) : loading && !data ? (
          <AttendeesSkeleton />
        ) : attendees.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-ink/40 px-4 py-6 text-center text-sm text-ink-soft">
            {hasAppliedFilters
              ? "No attendees match these filters."
              : "No attendees yet."}
          </p>
        ) : (
          <>
            <ul
              className={`flex flex-col gap-3 transition-opacity duration-300 ${
                loading ? "opacity-60" : "opacity-100"
              }`}
            >
              {attendees.map((attendee) => (
                <AttendeeRow
                  key={attendee.id}
                  attendee={attendee}
                  priceUnit={priceUnit}
                />
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
      </div>
    </section>
  );
}
