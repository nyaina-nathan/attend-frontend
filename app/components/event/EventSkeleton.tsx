/**
 * Loading placeholder for the event detail route: banner, title, info block and
 * a few tier cards. Shared by `loading.tsx` and the page's Suspense fallback.
 */
export default function EventSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="h-40 rounded-3xl border-2 border-ink/20 bg-ink/10 sm:h-56" />

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="h-9 w-3/4 rounded bg-ink/10" />
          <div className="h-4 w-1/2 rounded bg-ink/10" />
          <div className="h-4 w-2/5 rounded bg-ink/10" />
          <div className="mt-4 flex flex-col gap-3">
            <div className="h-3 w-full rounded bg-ink/10" />
            <div className="h-3 w-full rounded bg-ink/10" />
            <div className="h-3 w-2/3 rounded bg-ink/10" />
          </div>
          <div className="h-48 rounded-2xl border-2 border-ink/20 bg-paper" />
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border-2 border-ink/20 bg-paper p-6 lg:col-span-1">
          <div className="h-6 w-24 rounded bg-ink/10" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border-2 border-ink/10 p-4"
            >
              <div className="flex flex-col gap-2">
                <div className="h-4 w-28 rounded bg-ink/10" />
                <div className="h-3 w-16 rounded bg-ink/10" />
              </div>
              <div className="h-8 w-24 rounded-full bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
