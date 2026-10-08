import { redirect } from "next/navigation";
import { getMyTickets } from "@/app/lib/tickets";
import {
  buildTicketsHref,
  parseTicketsSearchParams,
  type RawSearchParams,
} from "@/app/lib/tickets-query";
import Pagination from "../ui/Pagination";
import TicketFilterChips from "./TicketFilterChips";
import TicketRow from "./TicketRow";
import TicketsEmpty from "./TicketsEmpty";
import TicketsError from "./TicketsError";

/**
 * Request-time results: awaits `searchParams`, fetches the caller's tickets and
 * renders behind `<Suspense>` so the page shell stays static. A 401 means the
 * session is gone, so redirect to login with a return path.
 */
export default async function TicketsResults({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const view = parseTicketsSearchParams(raw);

  const result = await getMyTickets(view.query);

  if (!result.ok) {
    if (result.status === 401) {
      redirect("/login?redirect=/dashboard/tickets");
    }
    return <TicketsError />;
  }

  const tickets = result.data.content ?? [];
  const total = result.data.totalElements ?? tickets.length;
  const totalPages = result.data.totalPages ?? 0;
  const currentPage = result.data.page ?? view.query.page;

  return (
    <div>
      <TicketFilterChips params={view.params} total={total} />

      {tickets.length === 0 ? (
        <TicketsEmpty hasFilters={view.hasFilters} />
      ) : (
        <>
          <ul className="mt-6 flex flex-col gap-4">
            {tickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </ul>
          <Pagination
            params={view.params}
            page={currentPage}
            totalPages={totalPages}
            buildHref={buildTicketsHref}
          />
        </>
      )}
    </div>
  );
}
