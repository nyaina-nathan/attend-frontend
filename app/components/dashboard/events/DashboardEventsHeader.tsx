import Button from "../../ui/Button";
import Eyebrow from "../../ui/Eyebrow";
import { ArrowUpRight, Calendar } from "../../ui/icons";

/** Page header for the hosted-events list. */
export default function DashboardEventsHeader() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4">
        <Eyebrow className="self-start">Dashboard</Eyebrow>
        <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl">
          My events
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Every event you host — public or private — with the tools to manage it.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          href="/events"
          variant="outline"
          className="shrink-0"
          icon={<Calendar className="h-4 w-4" />}
        >
          Browse events
        </Button>
        <Button
          href="/dashboard/events?create=1"
          variant="accent"
          className="shrink-0"
          icon={<ArrowUpRight className="h-4 w-4" />}
        >
          Create event
        </Button>
      </div>
    </div>
  );
}
