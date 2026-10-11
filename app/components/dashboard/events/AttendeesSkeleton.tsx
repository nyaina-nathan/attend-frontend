/** Loading placeholder for the attendees section. */
export default function AttendeesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border-2 border-ink/20 bg-paper p-4"
          >
            <div className="h-11 w-11 shrink-0 rounded-xl bg-ink/10" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-4 w-1/3 rounded bg-ink/10" />
              <div className="h-3 w-1/4 rounded bg-ink/10" />
            </div>
            <div className="h-6 w-20 rounded-full bg-ink/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
