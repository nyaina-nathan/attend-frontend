"use client";

import Link from "next/link";
import {
  formatEventDateTime,
  formatEventDay,
  formatPrice,
} from "@/app/lib/format";
import type { Order } from "@/app/lib/types";
import { useMounted } from "../events/useMounted";
import { Calendar, MapPin, Receipt } from "../ui/icons";
import OrderStatusBadge from "./OrderStatusBadge";

/** Slim event view resolved server-side and passed to the row. */
export interface OrderRowEvent {
  title: string;
  startTime: string;
  location: string | null;
}

/**
 * One order in the list. Client-side so the date block is timezone-localized
 * after mount (UTC before) to avoid a hydration mismatch.
 */
export default function OrderRow({
  order,
  event,
}: {
  order: Order;
  event: OrderRowEvent | null;
}) {
  const mounted = useMounted();
  const timeZone = mounted ? undefined : "UTC";
  const code = `ORD-${order.id.slice(0, 8).toUpperCase()}`;

  const anchor = event?.startTime ?? order.createdAt;
  const { day, month } = formatEventDay(anchor, timeZone);
  const date = formatEventDateTime(anchor, timeZone);
  const created = formatEventDateTime(order.createdAt, timeZone);
  const itemsSummary = order.items
    .map((item) => `${item.tierName} ×${item.quantity}`)
    .join(" · ");

  return (
    <li className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-ink bg-brand sm:h-16 sm:w-16">
            <span className="font-display text-xl font-bold leading-none">
              {day}
            </span>
            <span className="font-mono text-[10px] tracking-wider">{month}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.orderStatus} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                {code}
              </span>
            </div>

            {event ? (
              <Link
                href={`/events/${order.eventId}`}
                className="mt-1.5 block line-clamp-2 font-display text-lg font-bold leading-tight transition-colors duration-300 ease-brutal hover:text-accent"
              >
                {event.title}
              </Link>
            ) : (
              <p className="mt-1.5 line-clamp-2 font-display text-lg font-bold leading-tight">
                Ticket order
              </p>
            )}

            <div className="mt-1.5 flex flex-col gap-1 text-sm text-ink-soft">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <time dateTime={anchor}>{date}</time>
              </span>
              {event ? (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {event.location ?? "Online"}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border-2 border-ink bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
            <Receipt className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[14rem] truncate">{itemsSummary}</span>
          </span>
          <span className="font-display text-lg font-bold">
            {formatPrice(order.total, order.priceUnit)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            Placed {created}
          </span>
          {order.transactionReference ? (
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
              Ref {order.transactionReference}
            </span>
          ) : null}
        </div>
      </div>

      {order.orderStatus === "REFUSED" && order.refusalReason ? (
        <p className="mt-4 rounded-xl border-2 border-ink/20 bg-surface px-3 py-2 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            Reason
          </span>{" "}
          <span className="text-ink">{order.refusalReason}</span>
        </p>
      ) : null}
    </li>
  );
}
