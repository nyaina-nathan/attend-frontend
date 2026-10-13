import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import { Receipt } from "../ui/icons";

/** Page header for the orders list. */
export default function OrdersHeader() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4">
        <Eyebrow className="self-start">My orders</Eyebrow>
        <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl">
          My orders
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Every ticket order you’ve placed, newest first — with its payment
          method and review status.
        </p>
      </div>
      <Button
        href="/events"
        variant="outline"
        className="shrink-0"
        icon={<Receipt className="h-4 w-4" />}
      >
        Browse events
      </Button>
    </div>
  );
}
