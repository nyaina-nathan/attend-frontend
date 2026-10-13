import type { ReactNode } from "react";
import { paymentTypeLabel } from "@/app/lib/payment-methods";
import type { PaymentMethod } from "@/app/lib/types";

/**
 * One payment method: type, provider, the account details buyers will pay to,
 * and an active/inactive badge. The optional `children` slot lets the edit view
 * append its own action buttons.
 */
export default function PaymentMethodCard({
  method,
  children,
}: {
  method: PaymentMethod;
  children?: ReactNode;
}) {
  return (
    <li className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="truncate font-display text-base font-bold">
          {method.providerName}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
            {paymentTypeLabel(method.paymentType)}
          </span>
          <span
            className={`inline-flex items-center rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
              method.isActive ? "bg-success text-paper" : "bg-paper text-ink-soft"
            }`}
          >
            {method.isActive ? "Active" : "Inactive"}
          </span>
        </span>
      </div>

      <dl className="mt-3 flex flex-col gap-2 text-sm">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-ink-soft">Account</dt>
          <dd className="font-semibold">{method.accountName}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-ink-soft">Number</dt>
          <dd className="font-mono text-xs">{method.accountIdentifier}</dd>
        </div>
        {method.routingDetails ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-ink-soft">Routing</dt>
            <dd className="font-mono text-xs">{method.routingDetails}</dd>
          </div>
        ) : null}
        {method.instructions ? (
          <div>
            <dt className="font-semibold text-ink-soft">Instructions</dt>
            <dd className="mt-1 whitespace-pre-line text-ink-soft">
              {method.instructions}
            </dd>
          </div>
        ) : null}
      </dl>

      {children}
    </li>
  );
}
