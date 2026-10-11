import type { Tier } from "@/app/lib/types";
import CreateTierButton from "./CreateTierButton";
import TierCard from "./TierCard";

/**
 * Overview of an event's ticket tiers. Organizers can add a tier here, and each
 * `TierCard` carries its own edit / delete actions.
 */
export default function DashboardEventTiers({
  eventId,
  tiers,
}: {
  eventId: string;
  tiers: Tier[];
}) {
  return (
    <section aria-labelledby="event-tiers">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="event-tiers"
          className="font-display text-xl font-bold tracking-tight"
        >
          Ticket tiers
        </h2>
        <CreateTierButton eventId={eventId} />
      </div>

      {tiers.length === 0 ? (
        <p className="mt-3 rounded-2xl border-2 border-dashed border-ink/40 px-4 py-6 text-center text-sm text-ink-soft">
          No ticket tiers yet.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </ul>
      )}
    </section>
  );
}
