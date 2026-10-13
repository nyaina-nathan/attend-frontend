/**
 * Small red marker for an event card: shown only when the caller organizes the
 * event and it still has `PENDING` orders to review (`isOrderPending === true`).
 * Anonymous callers and non-organizers receive `null`, so nothing is rendered.
 */
export default function PendingOrdersDot({
  pending,
}: {
  pending: boolean | null;
}) {
  if (pending !== true) return null;

  return (
    <span
      title="Pending orders to review"
      className="absolute -right-1.5 -top-1.5 z-10 h-3.5 w-3.5 rounded-full border-2 border-ink bg-danger"
    >
      <span className="sr-only">Pending orders to review</span>
    </span>
  );
}
