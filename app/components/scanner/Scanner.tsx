"use client";
import { useRef, useState } from "react";
import { Scanner as QrScanner } from "@yudiel/react-qr-scanner";
import { checkInTicket } from "@/app/lib/check-in";
import { Check, X } from "../ui/icons";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Result =
  | { kind: "ok"; name: string; tier: string }
  | { kind: "error"; title: string; detail?: string };

/** Friendly copy for the API's machine-readable check-in error codes. */
function checkInMessage(errorCode: string | undefined, status: number): string {
  if (status === 401) return "Your session expired. Please log in again.";
  switch (errorCode) {
    case "TICKET_NOT_FOUND":
      return "Ticket not found.";
    case "NOT_AN_ORGANIZER":
      return "You don’t organize this event.";
    case "TICKET_ALREADY_USED":
      return "Ticket has already been used.";
    case "TICKET_NOT_VALID":
      return "Ticket is cancelled or refunded.";
    case "TICKET_EXPIRED":
      return "Ticket is expired.";
    default:
      return "Check-in failed. Please try again.";
  }
}

/**
 * Camera check-in surface. Validates the scanned value as a ticket UUID, posts
 * it to `POST /tickets/{id}/check-in`, and shows a green or red result before
 * auto-resuming. Rendered inside `ScanButton`'s modal, which owns the backdrop;
 * the optional `onClose` powers this component's header close button.
 */
export function Scanner({
  eventTitle,
  onClose,
}: {
  /** Kept for callers; the event is resolved server-side from the ticket. */
  eventId: string;
  eventTitle: string;
  onClose?: () => void;
}) {
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const busy = useRef(false);

  async function checkIn(raw: string) {
    const id = raw.trim();
    if (busy.current) return;                 // ignore repeat frames
    if (!UUID_RE.test(id)) {
      return show({ kind: "error", title: "Not a valid ticket QR" });
    }
    busy.current = true;
    setPaused(true);

    try {
      const res = await checkInTicket(id);

      if (res.ok && res.data) {
        navigator.vibrate?.(100);
        return show({
          kind: "ok",
          name: res.data.owner.fullName,
          tier: res.data.tier.tierName,
        });
      }

      return show({
        kind: "error",
        title: checkInMessage(res.errorCode, res.status),
      });
    } catch {
      show({ kind: "error", title: "Network error", detail: "Try again" });
    }
  }

  function show(r: Result) {
    setResult(r);
    setTimeout(resume, r.kind === "ok" ? 1500 : 2500); // auto-resume
  }

  function resume() {
    setResult(null);
    busy.current = false;
    setPaused(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Check-in
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold">{eventTitle}</h2>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-2xl border-2 border-ink bg-ink">
        <QrScanner
          paused={paused}
          constraints={{ facingMode: "environment" }}
          onScan={(codes) => codes[0] && checkIn(codes[0].rawValue)}
          onError={(e) => console.error(e)}
        />
      </div>

      <div aria-live="assertive" className="min-h-16">
        {result ? (
          result.kind === "ok" ? (
            <div
              role="status"
              className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-success/10 px-4 py-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-success text-paper">
                <Check className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-bold">Checked in</p>
                <p className="truncate text-sm text-ink-soft">
                  {result.name} · {result.tier}
                </p>
              </div>
            </div>
          ) : (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-danger/10 px-4 py-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-danger text-paper">
                <X className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-bold">{result.title}</p>
                {result.detail ? (
                  <p className="truncate text-sm text-ink-soft">{result.detail}</p>
                ) : null}
              </div>
            </div>
          )
        ) : (
          <p className="text-sm text-ink-soft">
            {paused ? "Checking…" : "Point the camera at a ticket QR code."}
          </p>
        )}
      </div>
    </div>
  );
}
