import Button from "../ui/Button";
import { ArrowUpRight, Ticket } from "../ui/icons";

/**
 * Shown in place of the two Next-up cards when neither side has anything.
 */
export default function CombinedEmpty() {
  return (
    <section
      aria-label="Next up"
      className="flex flex-col items-center gap-5 rounded-3xl border-2 border-dashed border-ink/40 bg-paper px-6 py-14 text-center lg:col-span-2"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-accent-soft">
        <Ticket className="h-7 w-7" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-bold">Nothing on the horizon</p>
        <p className="max-w-md text-sm text-ink-soft">
          You’re not organizing anything and you don’t hold any upcoming
          tickets. Start something, or go find something to attend.
        </p>
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-3">
        <Button
          href="/dashboard/events?create=1"
          icon={<ArrowUpRight className="h-4 w-4" />}
        >
          Create event
        </Button>
        <Button href="/events" variant="outline">
          Browse events
        </Button>
      </div>
    </section>
  );
}
