import Link from "next/link";
import { Ticket } from "../ui/icons";

const filledCta =
  "inline-flex items-center justify-center rounded-full border-2 border-ink bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none";

const outlineCta =
  "inline-flex items-center justify-center rounded-full border-2 border-ink bg-paper px-6 py-3 text-sm font-semibold shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none";

/** Empty list: either no matches for the active filters, or no upcoming tickets. */
export default function TicketsEmpty({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-ink/40 bg-paper px-5 py-12 text-center sm:px-6 sm:py-16">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand">
          <Ticket className="h-7 w-7" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-display text-xl font-bold">No tickets match</p>
          <p className="text-sm text-ink-soft">
            Try another status, or go back to upcoming tickets.
          </p>
        </div>
        <Link href="/dashboard/tickets" scroll={false} className={`mt-2 ${filledCta}`}>
          Reset filters
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-ink/40 bg-paper px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand">
        <Ticket className="h-7 w-7" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-bold">No upcoming tickets</p>
        <p className="text-sm text-ink-soft">
          When you grab a ticket, it’ll show up here.
        </p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/events" className={filledCta}>
          Browse events
        </Link>
        <Link
          href="/dashboard/tickets?upcoming=false"
          scroll={false}
          className={outlineCta}
        >
          View all tickets
        </Link>
      </div>
    </div>
  );
}
