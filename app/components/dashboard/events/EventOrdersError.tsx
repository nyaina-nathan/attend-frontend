"use client";

/**
 * Inline failure state for the event orders section. Retry re-fetches the
 * current page locally (the list is loaded from the browser), rather than
 * refreshing the whole route.
 */
export default function EventOrdersError({
  onRetry,
  pending = false,
}: {
  onRetry: () => void;
  pending?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-ink/40 bg-paper px-5 py-8 text-center">
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-bold">
          We couldn’t load the orders
        </p>
        <p className="text-sm text-ink-soft">
          Something went wrong on our side. Please try again.
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={onRetry}
        className="rounded-full border-2 border-ink bg-brand px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
      >
        {pending ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}
