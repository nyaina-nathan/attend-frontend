import { redirect } from "next/navigation";
import { getMyInvitations } from "@/app/lib/invitations";
import {
  buildInvitationsHref,
  parseInvitationsSearchParams,
  type RawSearchParams,
} from "@/app/lib/invitations-query";
import Pagination from "../ui/Pagination";
import InvitationRow from "./InvitationRow";
import InvitationsEmpty from "./InvitationsEmpty";
import InvitationsError from "./InvitationsError";

/**
 * Request-time results: awaits `searchParams`, fetches the caller's invitations
 * and renders behind `<Suspense>` so the page shell stays static. A 401 means
 * the session is gone, so redirect to login.
 */
export default async function InvitationsResults({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const view = parseInvitationsSearchParams(raw);

  const result = await getMyInvitations(view.query);

  if (!result.ok) {
    if (result.status === 401) {
      redirect("/login");
    }
    return <InvitationsError />;
  }

  const invitations = result.data.content ?? [];
  const total = result.data.totalElements ?? invitations.length;
  const totalPages = result.data.totalPages ?? 0;
  const currentPage = result.data.page ?? view.query.page;

  if (invitations.length === 0) {
    return (
      <InvitationsEmpty
        direction={view.query.direction}
        hasFilters={view.hasFilters}
      />
    );
  }

  return (
    <div>
      <p className="mt-6 font-mono text-xs uppercase tracking-wider text-ink-soft">
        {total} {total === 1 ? "invitation" : "invitations"}
      </p>

      <ul className="mt-4 flex flex-col gap-4">
        {invitations.map((invitation) => (
          <InvitationRow
            key={invitation.id}
            invitation={invitation}
            direction={view.query.direction}
          />
        ))}
      </ul>

      <Pagination
        params={view.params}
        page={currentPage}
        totalPages={totalPages}
        buildHref={buildInvitationsHref}
      />
    </div>
  );
}
