"use client";

import { useEffect } from "react";

export default function EventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Something went wrong
      </h1>
      <p className="text-ink-soft">
        We couldn’t load this event. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full border-2 border-ink bg-brand px-6 py-3 text-sm font-semibold shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Try again
      </button>
    </div>
  );
}
