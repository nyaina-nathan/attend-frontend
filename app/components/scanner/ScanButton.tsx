"use client";

import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { QrCode } from "../ui/icons";
import { Scanner } from "./Scanner";

/**
 * "Scan" trigger for organizers. Opens the camera in a modal overlay; the
 * `Scanner` inside owns the check-in flow and calls `onClose` from its header.
 * The scanner mounts only while open so the camera stream is released on
 * dismiss. `variant` lets the trigger match its surroundings (e.g. an outline
 * button beside a card's primary action).
 */
export default function ScanButton({
  eventId,
  eventTitle,
  variant = "accent",
  className,
}: {
  eventId: string;
  eventTitle: string;
  variant?: "accent" | "outline";
  className?: string;
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
      <Button
        variant={variant}
        className={className}
        icon={<QrCode className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      >
        Scan
      </Button>

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
