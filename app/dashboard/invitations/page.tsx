import type { Metadata } from "next";
import { Suspense } from "react";
import InvitationsFilterBar from "@/app/components/invitations/InvitationsFilterBar";
import InvitationsHeader from "@/app/components/invitations/InvitationsHeader";
import InvitationsResults from "@/app/components/invitations/InvitationsResults";
import InvitationsSkeleton, {
  InvitationsFilterBarSkeleton,
} from "@/app/components/invitations/InvitationsSkeleton";
import type { RawSearchParams } from "@/app/lib/invitations-query";

export const metadata: Metadata = {
  title: "Invitations",
  description:
    "Invitations to help organize an event — accept, decline, or manage the ones you’ve sent.",
};

/**
 * The caller's invitations: received (default) or sent, switched through the
 * URL. The shell prerenders; the filter bar and the `searchParams`-dependent
 * list stream behind `<Suspense>`.
 */
export default function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <InvitationsHeader />

      <div className="mt-10">
        <Suspense fallback={<InvitationsFilterBarSkeleton />}>
          <InvitationsFilterBar />
        </Suspense>
      </div>

      <Suspense fallback={<InvitationsSkeleton />}>
        <InvitationsResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
