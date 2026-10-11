/**
 * Loading placeholder for the organizer event-detail route. Mirrors the
 * masthead, the about/tiers column and the details aside.
 */
export default function DashboardEventSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="h-4 w-32 rounded bg-ink/10" />

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 rounded-full bg-ink/10" />
          <div className="h-6 w-20 rounded-full bg-ink/10" />
        </div>
        <div className="h-9 w-3/4 rounded bg-ink/10" />
        <div className="h-4 w-1/2 rounded bg-ink/10" />
        <div className="h-4 w-2/5 rounded bg-ink/10" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <div className="flex flex-col gap-3">
            <div className="h-6 w-20 rounded bg-ink/10" />
            <div className="h-4 w-full rounded bg-ink/10" />
            <div className="h-4 w-5/6 rounded bg-ink/10" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-6 w-28 rounded bg-ink/10" />
            <div className="h-24 rounded-2xl border-2 border-ink/20 bg-paper" />
            <div className="h-24 rounded-2xl border-2 border-ink/20 bg-paper" />
          </div>
        </div>
        <div className="h-56 rounded-2xl border-2 border-ink/20 bg-paper lg:col-span-1" />
      </div>
    </div>
  );
}
