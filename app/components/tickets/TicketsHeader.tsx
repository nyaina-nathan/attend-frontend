import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import { Ticket } from "../ui/icons";

/** Page header for the tickets list. */
export default function TicketsHeader() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4">
        <Eyebrow className="self-start">My tickets</Eyebrow>
        <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl">
          My tickets
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Every ticket you hold — upcoming by default, with your QR codes ready
          at the door.
        </p>
      </div>
      <Button
        href="/events"
        variant="outline"
        className="shrink-0"
        icon={<Ticket className="h-4 w-4" />}
      >
        Browse events
      </Button>
    </div>
  );
}
