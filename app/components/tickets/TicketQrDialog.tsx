"use client";

import { useEffect, useRef } from "react";
import TicketCard from "../landing/TicketCard";
import { X } from "../ui/icons";

/**
 * Full-ticket QR overlay shared by the dashboard's "next ticket" card and the
 * tickets list. Focuses the close button on open, closes on Escape or a backdrop
 * click, and returns no DOM when closed. `onClose` is read through a ref so
 * callers can pass an inline callback without re-binding the key listener.
 */
export default function TicketQrDialog({
  open,
  onClose,
  title,
  date,
  venue,
  tier,
  code,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  date: string;
  venue: string;
  tier: string;
  code: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 py-8"
      role="presentation"
      onClick={() => onCloseRef.current()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ticket QR code for ${title}`}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md"
      >
        <div className="mb-3 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label="Close QR code"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="rounded-3xl border-2 border-ink bg-paper p-4 shadow-brutal-xl sm:p-6">
          <TicketCard
            title={title}
            date={date}
            venue={venue}
            tier={tier}
            price=""
            code={code}
          />
          <p className="mt-4 text-center text-sm font-semibold">
            Show this code at the door.
          </p>
        </div>
      </div>
    </div>
  );
}
