import { issuedCount } from "@/app/lib/edit-tier";
import { formatCount, formatPrice } from "@/app/lib/format";
import type { Tier } from "@/app/lib/types";
import TierActions from "./TierActions";

/**
 * One ticket tier: name, price, availability and a progress bar, plus the
 * organizer actions (edit / delete).
 */
export default function TierCard({ tier }: { tier: Tier }) {
  const issued = issuedCount(tier);
  const pct =
    tier.capacity > 0
      ? Math.min(100, Math.round((issued / tier.capacity) * 100))
      : 0;

  return (
    <li className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-display text-base font-bold">
          {tier.tierName}
        </span>
        <span className="shrink-0 font-display text-lg font-bold">
          {formatPrice(tier.price)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
        <span>
          {tier.remaining === 0 ? "Sold out" : `${formatCount(tier.remaining)} left`}
        </span>
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

      <TierActions tier={tier} />
    </li>
  );
}
