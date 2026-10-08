import Link from "next/link";

export default function EventNotFound() {
  return (
    <main
      id="main"
      className="flex min-h-[70vh] flex-1 flex-col items-center justify-center gap-5 px-4 text-center"
    >
      <span className="font-mono text-sm uppercase tracking-[0.2em] text-ink-soft">
        404
      </span>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Event not found
      </h1>
      <p className="text-ink-soft">
        This event doesn’t exist or may have been removed.
      </p>
      <Link
        href="/events"
        className="rounded-full border-2 border-ink bg-brand px-6 py-3 text-sm font-semibold shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Back to events
      </Link>
    </main>
  );
}
