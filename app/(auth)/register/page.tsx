import type { Metadata } from "next";
import { Suspense } from "react";
import AuthCardSkeleton from "@/app/components/auth/AuthCardSkeleton";
import RegisterForm from "@/app/components/auth/RegisterForm";
import { safeRedirect } from "@/app/lib/redirect";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create an Attend account to start organizing events or grab tickets.",
};

/**
 * Registration route. Mirrors the login page: the static card shell prerenders
 * and the `redirect` search param streams in behind `<Suspense>`.
 */
export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <RegisterFormForParams searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterFormForParams({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { redirect } = await searchParams;

  return <RegisterForm redirectTo={safeRedirect(redirect)} />;
}
