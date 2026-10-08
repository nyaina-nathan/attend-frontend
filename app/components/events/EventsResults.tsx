import { getCurrentUser } from "@/app/lib/auth";
import { getEvents, getMyEvents } from "@/app/lib/events";
import { parseEventsSearchParams, type RawSearchParams } from "@/app/lib/events-query";
import type { EventSummary, Page } from "@/app/lib/types";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import EventGrid from "./EventGrid";
import FilterChips from "./FilterChips";
import Pagination from "./Pagination";

/**
 * Request-time results: awaits `searchParams` and the session, then fetches the
 * listing. Renders behind `<Suspense>` so the page shell stays static.
 */
export default async function EventsResults({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const user = await getCurrentUser();
  const view = parseEventsSearchParams(raw, { isAuthenticated: Boolean(user) });

  let page: Page<EventSummary>;
  try {
    page = view.query.isMine ? await getMyEvents(view.query) : await getEvents(view.query);
  } catch {
    return <ErrorState />;
  }

  const events = page.content ?? [];
  const total = page.totalElements ?? events.length;
  const totalPages = page.totalPages ?? 0;
  const currentPage = page.page ?? view.query.page;

  return (
    <div>
      <FilterChips params={view.params} total={total} />

      {events.length === 0 ? (
        <EmptyState hasFilters={view.hasFilters} isAuthenticated={Boolean(user)} />
      ) : (
        <>
          <EventGrid events={events} />
          <Pagination params={view.params} page={currentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
