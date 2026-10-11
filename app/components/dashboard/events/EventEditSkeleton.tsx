/**
 * Loading placeholder for the edit-event route: a page header plus the event
 * form fields. Shown by the route's Suspense fallback and while the form waits
 * for the client clock/timezone to resolve (see `EventEditForm`).
 */
export default function EventEditSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="h-4 w-32 rounded bg-ink/10" />

      <div className="mt-6 flex flex-col gap-3">
        <div className="h-9 w-2/3 rounded bg-ink/10" />
        <div className="h-4 w-1/2 rounded bg-ink/10" />
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-3xl border-2 border-ink/20 bg-paper p-5 sm:p-6">
        <div className="h-5 w-40 rounded bg-ink/10" />
        <div className="h-12 rounded-xl bg-ink/10" />
        <div className="h-24 rounded-xl bg-ink/10" />
        <div className="h-12 rounded-xl bg-ink/10" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-12 rounded-xl bg-ink/10" />
          <div className="h-12 rounded-xl bg-ink/10" />
        </div>
        <div className="h-16 rounded-2xl bg-ink/10" />
      </div>
    </div>
  );
}
