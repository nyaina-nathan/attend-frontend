import Link from "next/link";

export default function DashboardEventNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="font-mono text-sm uppercase tracking-[0.2em] text-ink-soft">
        404
      </span>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Event not found
      </h1>
      <p className="text-ink-soft">
        This event doesn’t exist, or you’re not one of its organizers.
      </p>
      <Link
        href="/dashboard/events"
        className="rounded-full border-2 border-ink bg-brand px-6 py-3 text-sm font-semibold shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Back to my events
      </Link>
    </div>
  );
}
