import type { Metadata } from "next";
import { Suspense } from "react";
import AuthCardSkeleton from "@/app/components/auth/AuthCardSkeleton";
import LoginForm from "@/app/components/auth/LoginForm";
import { safeRedirect } from "@/app/lib/redirect";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to your Attend account to grab tickets or run your events.",
};

/**
 * Login route. The static card shell prerenders; the `redirect` search param is
 * a request-time value, so the form streams in behind `<Suspense>`.
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LoginFormForParams searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginFormForParams({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { redirect } = await searchParams;

  return <LoginForm redirectTo={safeRedirect(redirect)} />;
}
