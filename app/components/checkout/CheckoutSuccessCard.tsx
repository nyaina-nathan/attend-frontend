import Link from "next/link";
import { formatPrice } from "@/app/lib/format";
import type { Order } from "@/app/lib/types";
import { Check } from "../ui/icons";

/**
 * Confirmation shown after an order is created: a summary of the transaction,
 * a note that it will be confirmed soon, and a link back home.
 */
export default function CheckoutSuccessCard({
  order,
  eventTitle,
  methodLabel,
}: {
  order: Order;
  eventTitle: string;
  methodLabel: string | null;
}) {
  const code = `ORD-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <section
      aria-live="polite"
      className="rounded-3xl border-2 border-ink bg-accent-soft p-5 shadow-brutal-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-success text-paper">
          <Check className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Order placed
          </p>
          <h2 className="truncate font-display text-xl font-bold tracking-tight">
            {eventTitle}
          </h2>
        </div>
        <span className="ml-auto shrink-0 rounded-full border-2 border-ink bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
          {order.orderStatus}
        </span>
      </div>

      <dl className="mt-4 flex flex-col gap-1.5 text-sm">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3">
            <dt className="min-w-0 truncate text-ink-soft">
              {item.tierName} × {item.quantity}
            </dt>
            <dd className="shrink-0 font-semibold">
              {formatPrice(item.lineTotal, order.priceUnit)}
            </dd>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between gap-3 border-t-2 border-ink/15 pt-2">
          <dt className="font-display font-bold">Total</dt>
          <dd className="font-display text-lg font-bold">
            {formatPrice(order.total, order.priceUnit)}
          </dd>
        </div>
      </dl>

      <dl className="mt-4 flex flex-col gap-2 text-sm">
        {methodLabel ? (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
              Payment method
            </dt>
            <dd className="font-semibold">{methodLabel}</dd>
          </div>
        ) : null}
        {order.transactionReference ? (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
              Reference
            </dt>
            <dd className="font-mono text-xs">{order.transactionReference}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            Order
          </dt>
          <dd className="font-mono text-xs">{code}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        Your order will be confirmed soon. Check out your order section in the
        dashboard.
      </p>

      <Link
        href="/"
        className="mt-3 inline-flex text-sm font-semibold text-accent underline decoration-2 underline-offset-4 transition-colors duration-300 ease-brutal hover:text-ink"
      >
        Return to home page
      </Link>
    </section>
  );
}
