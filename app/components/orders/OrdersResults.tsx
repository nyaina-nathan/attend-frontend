import { redirect } from "next/navigation";
import { getMyOrders, getOrderEvents } from "@/app/lib/orders";
import {
  buildOrdersHref,
  parseOrdersSearchParams,
  type RawSearchParams,
} from "@/app/lib/orders-query";
import Pagination from "../ui/Pagination";
import OrderFilterChips from "./OrderFilterChips";
import OrderRow from "./OrderRow";
import OrdersEmpty from "./OrdersEmpty";
import OrdersError from "./OrdersError";

/**
 * Request-time results: awaits `searchParams`, fetches the caller's orders and
 * enriches them with their events, all behind `<Suspense>`. A 401 means the
 * session is gone, so redirect to login.
 */
export default async function OrdersResults({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const view = parseOrdersSearchParams(raw);

  const result = await getMyOrders(view.query);

  if (!result.ok) {
    if (result.status === 401) {
      redirect("/login");
    }
    return <OrdersError />;
  }

  const orders = result.data.content ?? [];
  const total = result.data.totalElements ?? orders.length;
  const totalPages = result.data.totalPages ?? 0;
  const currentPage = result.data.page ?? view.query.page;

  const events = await getOrderEvents(orders.map((order) => order.eventId));

  return (
    <div>
      <OrderFilterChips params={view.params} total={total} />

      {orders.length === 0 ? (
        <OrdersEmpty hasFilters={view.hasFilters} />
      ) : (
        <>
          <ul className="mt-6 flex flex-col gap-4">
            {orders.map((order) => {
              const event = events.get(order.eventId);
              return (
                <OrderRow
                  key={order.id}
                  order={order}
                  event={
                    event
                      ? {
                          title: event.title,
                          startTime: event.startTime,
                          location: event.location,
                        }
                      : null
                  }
                />
              );
            })}
          </ul>
          <Pagination
            params={view.params}
            page={currentPage}
            totalPages={totalPages}
            buildHref={buildOrdersHref}
          />
        </>
      )}
    </div>
  );
}
