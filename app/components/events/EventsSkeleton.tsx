export function FilterBarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[70px] animate-pulse rounded-2xl border-2 border-ink/20 bg-paper md:h-[150px]"
    />
  );
}

export default function EventsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col rounded-2xl border-2 border-ink/20 bg-paper"
        >
          <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
            <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-ink/10" />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-ink/10" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-ink/10" />
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between border-t-2 border-ink/10 px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="h-3 w-24 animate-pulse rounded bg-ink/10" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-ink/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
