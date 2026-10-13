import { redirect } from "next/navigation";
import { getEventPaymentMethods } from "@/app/lib/event";
import PaymentMethodCard from "./PaymentMethodCard";

/**
 * Read-only list of an event's payment methods on the organizer detail page.
 * The caller is already known to be an organizer, so a `403`/`404` renders
 * nothing and a `401` redirects to login. Management lives on the edit screen.
 */
export default async function PaymentMethodsSection({
  eventId,
}: {
  eventId: string;
}) {
  const result = await getEventPaymentMethods(eventId);

  if (!result.ok) {
    if (result.status === 401) redirect("/login");
    if (result.status === 403 || result.status === 404) return null;
    return (
      <section aria-labelledby="event-payment-methods">
        <h2
          id="event-payment-methods"
          className="font-display text-xl font-bold tracking-tight"
        >
          Payment methods
        </h2>
        <p className="mt-3 rounded-2xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          We couldn’t load the payment methods. Please try again.
        </p>
      </section>
    );
  }

  const methods = result.data;

  return (
    <section aria-labelledby="event-payment-methods">
      <h2
        id="event-payment-methods"
        className="font-display text-xl font-bold tracking-tight"
      >
        Payment methods
      </h2>

      {methods.length === 0 ? (
        <p className="mt-3 rounded-2xl border-2 border-dashed border-ink/40 px-4 py-6 text-center text-sm text-ink-soft">
          No payment methods yet.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {methods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** Placeholder shown while the payment methods stream in. */
export function PaymentMethodsSkeleton() {
  return (
    <section aria-label="Payment methods">
      <div className="h-6 w-40 animate-pulse rounded bg-ink/10" />
      <div className="mt-3 flex flex-col gap-3">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border-2 border-ink/10 bg-ink/5"
          />
        ))}
      </div>
    </section>
  );
}
