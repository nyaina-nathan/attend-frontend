import type { Metadata } from "next";
import LoginForm from "@/app/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to your Attend account to grab tickets or run your events.",
};

/**
 * Reads `?next=` (searchParams), so the route blocks rather than prerendering.
 * @see https://nextjs.org/docs/messages/blocking-prerender-dynamic
 */
export const instant = false;

/**
 * Only allow internal, single-slash paths as a post-login destination, so a
 * crafted `?next=` can't redirect off-site.
 */
function safeNext(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

/**
 * Login route. Lands on the dashboard by default, or back on `?next=` (e.g.
 * returning a buyer to `/checkout`).
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  return <LoginForm next={safeNext(params.next)} />;
}
