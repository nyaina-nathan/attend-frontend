import Link from "next/link";
import { getCurrentUser } from "@/app/lib/auth";
import { initials } from "@/app/lib/format";
import Button from "../ui/Button";
import { ArrowUpRight } from "../ui/icons";

type Variant = "desktop" | "mobile";

/**
 * Auth control for the public site navbar. Streaming is required because it
 * reads the request session, so every usage sits behind a `<Suspense>`
 * boundary. Anonymous callers get the log-in / sign-up actions; authenticated
 * callers get their avatar, name, and a link into the dashboard.
 */
export default async function NavbarAuth({
  variant = "desktop",
}: {
  variant?: Variant;
}) {
  const user = await getCurrentUser();

  if (!user) {
    if (variant === "mobile") {
      return (
        <>
          <Link
            href="/login"
            className="rounded-full border-2 border-paper px-6 py-3.5 text-center font-semibold text-paper"
          >
            Log in
          </Link>
          <Button
            href="/register"
            size="lg"
            className="w-full"
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            Sign up
          </Button>
        </>
      );
    }

    return (
      <>
        <Link
          href="/login"
          className="rounded-full px-3 py-2 text-sm font-semibold text-ink transition-colors duration-300 ease-brutal hover:bg-ink/5"
        >
          Log in
        </Link>
        <Button href="/register" icon={<ArrowUpRight className="h-4 w-4" />}>
          Sign up
        </Button>
      </>
    );
  }

  const avatar = (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-ink bg-accent font-bold text-paper ${
        variant === "mobile" ? "h-11 w-11 text-sm" : "h-9 w-9 text-[11px]"
      }`}
    >
      {initials(user.fullName)}
    </span>
  );

  const mobile = variant === "mobile";
  const name = (
    <span className="flex min-w-0 max-w-[9rem] flex-col leading-tight">
      <span
        className={`truncate text-sm font-semibold ${
          mobile ? "text-paper" : "text-ink"
        }`}
      >
        {user.fullName}
      </span>
      <span
        className={`truncate font-mono text-[10px] ${
          mobile ? "text-paper/70" : "text-ink-soft"
        }`}
      >
        @{user.username}
      </span>
    </span>
  );

  if (variant === "mobile") {
    return (
      <>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-paper/20 px-4 py-3">
          {avatar}
          {name}
        </div>
        <Button
          href="/dashboard"
          size="lg"
          className="w-full"
          icon={<ArrowUpRight className="h-4 w-4" />}
        >
          Dashboard
        </Button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {avatar}
      {name}
      <Button href="/dashboard" icon={<ArrowUpRight className="h-4 w-4" />}>
        Dashboard
      </Button>
    </div>
  );
}

/** Matches the auth control's footprint while the session resolves. */
export function NavbarAuthSkeleton({
  variant = "desktop",
}: {
  variant?: Variant;
}) {
  if (variant === "mobile") {
    return (
      <div aria-hidden="true" className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-paper/20 px-4 py-3">
          <span className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-paper/20" />
          <span className="flex min-w-0 flex-col gap-1.5">
            <span className="h-3.5 w-24 animate-pulse rounded bg-paper/20" />
            <span className="h-2.5 w-16 animate-pulse rounded bg-paper/20" />
          </span>
        </div>
        <span className="h-[52px] w-full animate-pulse rounded-full bg-paper/20" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="flex items-center gap-3">
      <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-ink/10" />
      <span className="flex flex-col gap-1.5">
        <span className="h-3.5 w-20 animate-pulse rounded bg-ink/10" />
        <span className="h-2.5 w-14 animate-pulse rounded bg-ink/10" />
      </span>
      <span className="h-10 w-28 animate-pulse rounded-full bg-ink/10" />
    </div>
  );
}
