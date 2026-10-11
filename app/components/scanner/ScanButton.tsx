"use client";

import { useEffect, useState } from "react";
import { QrCode } from "../ui/icons";
import { Scanner } from "./Scanner";

/**
 * "Scan" trigger for the organizer event detail page. Opens the camera in a
 * modal overlay; the `Scanner` inside owns the check-in flow and calls
 * `onClose` from its header. The scanner mounts only while open so the camera
 * stream is released on dismiss.
 */
export default function ScanButton({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock body scroll while the scanner is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-4 py-2 text-xs font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        <QrCode className="h-3.5 w-3.5" />
        Scan
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 px-4 py-8 sm:items-center"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Scan tickets for ${eventTitle}`}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-xl sm:p-6"
          >
            <Scanner
              eventId={eventId}
              eventTitle={eventTitle}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
