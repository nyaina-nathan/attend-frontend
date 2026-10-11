"use client";

import { useEffect, useRef } from "react";
import TicketCard from "../landing/TicketCard";
import { X } from "../ui/icons";

/**
 * Full-ticket QR overlay shared by the dashboard's "next ticket" card and the
 * tickets list. Full-screen on mobile — so the QR is easy to show at the door —
 * and a centered modal from `sm` up. Focuses the close button on open, closes
 * on Escape or a backdrop click, locks body scroll, and returns no DOM when
 * closed. `onClose` is read through a ref so callers can pass an inline callback
 * without re-binding the key listener.
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/70 sm:items-center sm:justify-center sm:overflow-y-auto sm:p-4"
      role="presentation"
      onClick={() => onCloseRef.current()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ticket QR code for ${title}`}
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full flex-col bg-paper sm:h-auto sm:max-w-md sm:rounded-3xl sm:border-2 sm:border-ink sm:shadow-brutal-xl"
      >
        <header className="flex items-center justify-between gap-3 border-b-2 border-ink px-4 py-3 sm:border-b-0 sm:px-5 sm:pb-0 sm:pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Your ticket
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label="Close QR code"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:block sm:flex-none sm:p-5">
          <div className="my-auto flex w-full flex-col items-center gap-4">
            <TicketCard
              title={title}
              date={date}
              venue={venue}
              tier={tier}
              price=""
              code={code}
            />
            <p className="text-center text-sm font-semibold">
              Show this code at the door.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
