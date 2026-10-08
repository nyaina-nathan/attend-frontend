/** Loading placeholder for `/dashboard`, mirroring each block's real shape. */
export default function DashboardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <div className="h-6 w-24 animate-pulse rounded-full bg-ink/10" />
          <div className="h-10 w-72 animate-pulse rounded bg-ink/10" />
          <div className="h-4 w-56 animate-pulse rounded bg-ink/10" />
        </div>
        <div className="h-12 w-40 animate-pulse rounded-full bg-ink/10" />
      </div>

      {/* Next up */}
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-3xl border-2 border-ink/20 bg-paper"
          />
        ))}
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border-2 border-ink/20 bg-paper"
          />
        ))}
      </div>

      {/* Attention */}
      <div className="h-56 animate-pulse rounded-3xl border-2 border-ink/20 bg-paper" />
    </div>
  );
}
