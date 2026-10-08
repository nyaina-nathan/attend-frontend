import Button from "../ui/Button";
import { ArrowUpRight, Ticket } from "../ui/icons";

/** First-run state shown when a user has no events, tickets or attention items. */
export default function WelcomeState({ fullName }: { fullName: string }) {
  return (
    <section className="flex flex-col items-center gap-5 rounded-3xl border-2 border-ink bg-paper px-6 py-16 text-center shadow-brutal">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand shadow-brutal-sm">
        <Ticket className="h-7 w-7" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold">
          Welcome, {fullName}
        </h2>
        <p className="max-w-md text-sm text-ink-soft">
          You don’t have any events or tickets yet. Create your own event, or
          find something to attend.
        </p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button href="/events/new" icon={<ArrowUpRight className="h-4 w-4" />}>
          Create an event
        </Button>
        <Button href="/events" variant="outline" icon={<Ticket className="h-4 w-4" />}>
          Browse events
        </Button>
      </div>
    </section>
  );
}
