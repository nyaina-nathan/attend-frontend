import QrCode from "../ui/QrCode";
import { Calendar, MapPin, Ticket } from "../ui/icons";

/**
 * Reusable mock ticket with a QR graphic. Reused on the "My tickets" page later.
 */
export default function TicketCard({
  title = "Neon Nights Festival",
  date = "Sat, Jun 14 · 8:00 PM",
  venue = "Warehouse 9, Berlin",
  tier = "General admission",
  price = "Free",
  code = "ATT-4F9C-2B",
  className = "",
}: {
  title?: string;
  date?: string;
  venue?: string;
  tier?: string;
  price?: string;
  code?: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div
        aria-hidden="true"
        className="absolute inset-x-3 top-5 h-full rounded-3xl border-2 border-ink bg-accent"
      />
      <div className="relative overflow-hidden rounded-3xl border-2 border-ink bg-paper shadow-brutal-xl">
        <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-ink bg-brand px-5 py-4">
          <span className="font-display text-sm font-bold uppercase tracking-wider">
            Admit one
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
            {code}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-4 p-5">
          <div className="flex min-w-0 flex-col gap-3">
            <p className="font-display text-xl font-bold leading-tight">
              {title}
            </p>
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate">{date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{venue}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
                <Ticket className="h-3.5 w-3.5" />
                {tier}
              </span>
              <span className="font-display text-lg font-bold">{price}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 border-l-2 border-dashed border-ink pl-4">
            <QrCode className="h-24 w-24" />
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-soft">
              Scan at door
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
