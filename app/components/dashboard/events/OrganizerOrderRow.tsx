"use client";

import { formatPrice, initials } from "@/app/lib/format";
import type { Order } from "@/app/lib/types";
import LocalDateTime from "../../event/LocalDateTime";
import OrderStatusBadge from "../../orders/OrderStatusBadge";
import { Check, X } from "../../ui/icons";

const eyebrow =
  "font-mono text-[10px] uppercase tracking-wider text-ink-soft";

/**
 * One order on an event, built from `GET /events/{eventId}/orders`: who ordered,
 * what they ordered, what they'll pay, the payment reference and the review
 * state. Pending orders expose Approve / Refuse to organizers.
 */
export default function OrganizerOrderRow({
  order,
  priceUnit,
  paymentLabel,
  canReview,
  pending,
  onApprove,
  onRefuse,
}: {
  order: Order;
  priceUnit: string;
  /** Resolved payment method name, when the event's methods were loaded. */
  paymentLabel?: string;
  /** Whether the caller may approve/refuse (any event organizer). */
  canReview: boolean;
  /** An approve/refuse request for this order is in flight. */
  pending: boolean;
  onApprove: (order: Order) => void;
  onRefuse: (order: Order) => void;
}) {
  const code = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
  const itemsSummary = order.items
    .map((item) => `${item.tierName} ×${item.quantity}`)
    .join(" · ");
  const isPending = order.orderStatus === "PENDING";

  return (
    <li className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-brand">
            <span className="font-display text-sm font-bold leading-none">
              {initials(order.owner.fullName)}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold">
              {order.owner.fullName}
            </p>
            <p className="truncate font-mono text-xs text-ink-soft">
              @{order.owner.username}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.orderStatus} />
            <span className={eyebrow}>{code}</span>
          </div>
          <p className="mt-2 text-sm font-semibold">{itemsSummary}</p>
          <div className="mt-1.5 flex flex-col gap-1 text-sm text-ink-soft">
            <span>
              Placed <LocalDateTime startTime={order.createdAt} />
            </span>
            {paymentLabel ? <span>Paid via {paymentLabel}</span> : null}
            {order.transactionReference ? (
              <span>Ref {order.transactionReference}</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end">
          <span className="font-display text-base font-bold">
            {formatPrice(order.total, priceUnit)}
          </span>
          {isPending && canReview ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onApprove(order)}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-success px-3.5 py-1.5 text-xs font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => onRefuse(order)}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3.5 py-1.5 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
              >
                <X className="h-3.5 w-3.5" />
                Refuse
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {order.orderStatus === "REFUSED" && order.refusalReason ? (
        <p className="mt-4 rounded-xl border-2 border-ink/20 bg-surface px-3 py-2 text-sm">
          <span className={eyebrow}>Reason</span>{" "}
          <span className="text-ink">{order.refusalReason}</span>
        </p>
      ) : null}

      {order.reviewedBy && order.reviewedAt ? (
        <p className={`mt-2 ${eyebrow}`}>
          Reviewed by {order.reviewedBy.fullName} ·{" "}
          <LocalDateTime startTime={order.reviewedAt} />
        </p>
      ) : null}
    </li>
  );
}
