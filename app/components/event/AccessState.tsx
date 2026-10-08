import Link from "next/link";
import Button from "../ui/Button";
import { ArrowUpRight, Lock } from "../ui/icons";

/**
 * Full-section replacement for the 401 (anonymous, private event) and 403
 * (authenticated non-organizer) outcomes.
 */
export default function AccessState({
  kind,
  redirect,
}: {
  kind: "login" | "forbidden";
  redirect?: string;
}) {
  const loginHref = `/login?redirect=${encodeURIComponent(redirect ?? "/events")}`;

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand shadow-brutal-sm">
        <Lock className="h-7 w-7" />
      </span>

      {kind === "login" ? (
        <>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Log in to view this event
          </h1>
          <p className="text-ink-soft">
            This event is private. Log in with an organizer account to see the
            details and tickets.
          </p>
          <Button href={loginHref} size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
            Log in
          </Button>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            You don’t have access to this event
          </h1>
          <p className="text-ink-soft">
            This event is private and your account isn’t an organizer on it.
          </p>
          <Link
            href="/events"
            className="rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Back to events
          </Link>
        </>
      )}
    </div>
  );
}
