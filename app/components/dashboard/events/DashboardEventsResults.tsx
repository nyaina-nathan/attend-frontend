import { redirect } from "next/navigation";
import { getMyEventsResult } from "@/app/lib/events";
import {
  buildDashboardEventsHref,
  parseDashboardEventsSearchParams,
  type RawSearchParams,
} from "@/app/lib/events-query";
import Pagination from "../../ui/Pagination";
import Reveal from "../../ui/Reveal";
import DashboardEventCard from "./DashboardEventCard";
import DashboardEventChips from "./DashboardEventChips";
import DashboardEventsEmpty from "./DashboardEventsEmpty";
import DashboardEventsError from "./DashboardEventsError";

/**
 * Request-time results: awaits `searchParams`, fetches the caller's own events
 * and renders behind `<Suspense>` so the page shell stays static. A 401 means
 * the session is gone, so redirect to login.
 */
export default async function DashboardEventsResults({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const view = parseDashboardEventsSearchParams(raw);

  const result = await getMyEventsResult(view.query);

  if (!result.ok) {
    if (result.status === 401) {
      redirect("/login");
    }
    return <DashboardEventsError />;
  }

  const events = result.data.content ?? [];
  const total = result.data.totalElements ?? events.length;
  const totalPages = result.data.totalPages ?? 0;
  const currentPage = result.data.page ?? view.query.page;

  return (
    <div>
      <DashboardEventChips params={view.params} total={total} />

      {events.length === 0 ? (
        <DashboardEventsEmpty hasFilters={view.hasFilters} />
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {events.map((event, index) => (
              <Reveal key={event.id} delay={Math.min(index, 8) * 60}>
                <DashboardEventCard event={event} />
              </Reveal>
            ))}
          </div>
          <Pagination
            params={view.params}
            page={currentPage}
            totalPages={totalPages}
            buildHref={buildDashboardEventsHref}
          />
        </>
      )}
    </div>
  );
}
