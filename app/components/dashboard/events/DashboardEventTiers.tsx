import { formatCount, formatPrice } from "@/app/lib/format";
import type { Tier } from "@/app/lib/types";

/**
 * Read-only overview of an event's ticket tiers (name, price and how many of
 * the capacity are issued). Editing tiers is a later step.
 */
export default function DashboardEventTiers({ tiers }: { tiers: Tier[] }) {
  return (
    <section aria-labelledby="event-tiers">
      <h2
        id="event-tiers"
        className="font-display text-xl font-bold tracking-tight"
      >
        Ticket tiers
      </h2>

      {tiers.length === 0 ? (
        <p className="mt-3 rounded-2xl border-2 border-dashed border-ink/40 px-4 py-6 text-center text-sm text-ink-soft">
          No ticket tiers yet.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {tiers.map((tier) => {
            const issued = Math.max(0, tier.capacity - tier.remaining);
            const pct =
              tier.capacity > 0
                ? Math.min(100, Math.round((issued / tier.capacity) * 100))
                : 0;

            return (
              <li
                key={tier.id}
                className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-display text-base font-bold">
                    {tier.tierName}
                  </span>
                  <span className="shrink-0 font-display text-lg font-bold">
                    {formatPrice(tier.price)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                  <span>{tier.remaining === 0 ? "Sold out" : `${formatCount(tier.remaining)} left`}</span>
                  <span>
                    {formatCount(issued)} / {formatCount(tier.capacity)} issued
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full border-2 border-ink bg-paper">
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={issued}
                    aria-valuemin={0}
                    aria-valuemax={tier.capacity}
                    aria-label={`${tier.tierName} issued`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
