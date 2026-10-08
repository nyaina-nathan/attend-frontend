"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function ErrorState() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border-2 border-ink bg-paper px-6 py-16 text-center shadow-brutal-sm">
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-bold">Something went wrong</p>
        <p className="text-sm text-ink-soft">
          We couldn’t load events right now. Please try again.
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
        className="mt-2 rounded-full border-2 border-ink bg-brand px-6 py-3 text-sm font-semibold shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
      >
        {pending ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}
