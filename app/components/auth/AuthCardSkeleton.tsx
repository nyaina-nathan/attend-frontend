/**
 * Placeholder shown while the auth page streams its `searchParams`-dependent
 * form. Mirrors the real card's footprint so the swap-in doesn't shift layout.
 */
export default function AuthCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-3xl border-2 border-ink bg-paper p-6 shadow-brutal-xl sm:p-8"
    >
      <div className="h-8 w-44 rounded-lg bg-ink/10" />
      <div className="mt-2 h-4 w-56 rounded bg-ink/10" />
      <div className="mt-6 flex flex-col gap-4">
        <div className="h-16 rounded-xl bg-ink/5" />
        <div className="h-16 rounded-xl bg-ink/5" />
        <div className="h-12 rounded-full bg-ink/10" />
      </div>
    </div>
  );
}
