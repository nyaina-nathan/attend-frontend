import { formatCount, formatMoney } from "@/app/lib/format";
import type { AttendingDashboard, OrganizingDashboard } from "@/app/lib/types";

interface Tile {
  label: string;
  value: string;
  subtext?: string;
}

/**
 * Glanceable counters. Events/tickets/revenue are scoped to upcoming events by
 * the API; the optional fifth tile reflects the attendee side.
 */
export default function StatTiles({
  organizing,
  attending,
}: {
  organizing: OrganizingDashboard;
  attending: AttendingDashboard;
}) {
  const tiles: Tile[] = [
    {
      label: "Events organized",
      value: formatCount(organizing.eventsTotal),
      subtext: `${formatCount(organizing.eventsUpcoming)} upcoming`,
    },
    {
      label: "Upcoming events",
      value: formatCount(organizing.eventsUpcoming),
    },
    {
      label: "Tickets sold",
      value: formatCount(organizing.ticketsSold),
      subtext: "across upcoming events",
    },
    {
      label: "Revenue",
      value: formatMoney(organizing.revenue),
      subtext: "across upcoming events",
    },
    {
      label: "Tickets I hold",
      value: formatCount(attending.ticketsUpcoming),
    },
  ];

  return (
    <section aria-label="At a glance">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="flex flex-col gap-1 rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              {tile.label}
            </p>
            <p className="font-display text-2xl font-bold leading-none sm:text-3xl">
              {tile.value}
            </p>
            {tile.subtext ? (
              <p className="text-xs text-ink-soft">{tile.subtext}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
