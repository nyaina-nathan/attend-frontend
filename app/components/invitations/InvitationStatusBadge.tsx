import type { InvitationStatus } from "@/app/lib/types";

const statusStyles: Record<
  InvitationStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-warning text-paper" },
  ACCEPTED: { label: "Accepted", className: "bg-success text-paper" },
  DECLINED: { label: "Declined", className: "bg-danger text-paper" },
};

/** Invitation lifecycle pill: pending / accepted / declined. */
export default function InvitationStatusBadge({
  status,
}: {
  status: InvitationStatus;
}) {
  const meta = statusStyles[status];
  return (
    <span
      className={`inline-flex rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
