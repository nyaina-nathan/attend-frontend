"use client";

import type { RefObject } from "react";
import {
  PAYMENT_TYPES,
  type PaymentMethodDraft,
} from "@/app/lib/payment-methods";

const inputClass =
  "w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/60 focus:border-accent";

/**
 * Shared `PaymentMethodCreateRequest` / `PaymentMethodUpdateRequest` fields used
 * by the create-event wizard and the create / edit dialogs. The optional `error`
 * is shown above the fields; `nameInputRef` lets a dialog focus the first input
 * on mount.
 */
export default function PaymentMethodFields({
  draft,
  error,
  onChange,
  nameInputRef,
}: {
  draft: PaymentMethodDraft;
  error?: string | null;
  onChange: (patch: Partial<PaymentMethodDraft>) => void;
  nameInputRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink">Type</span>
          <select
            name="paymentType"
            value={draft.paymentType}
            onChange={(event) =>
              onChange({
                paymentType: event.target.value as PaymentMethodDraft["paymentType"],
              })
            }
            className={inputClass}
          >
            {PAYMENT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink">Provider / bank</span>
          <input
            ref={nameInputRef}
            type="text"
            name="providerName"
            value={draft.providerName}
            maxLength={100}
            onChange={(event) => onChange({ providerName: event.target.value })}
            placeholder="Acme Bank"
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink">Account name</span>
          <input
            type="text"
            name="accountName"
            value={draft.accountName}
            maxLength={150}
            onChange={(event) => onChange({ accountName: event.target.value })}
            placeholder="Ada Lovelace"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink">
            Account number
          </span>
          <input
            type="text"
            name="accountIdentifier"
            value={draft.accountIdentifier}
            maxLength={100}
            onChange={(event) =>
              onChange({ accountIdentifier: event.target.value })
            }
            placeholder="0123456789"
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink">
          Routing details{" "}
          <span className="font-normal text-ink-soft">(optional)</span>
        </span>
        <input
          type="text"
          name="routingDetails"
          value={draft.routingDetails}
          maxLength={100}
          onChange={(event) => onChange({ routingDetails: event.target.value })}
          placeholder="Sort code, branch, network…"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink">
          Instructions{" "}
          <span className="font-normal text-ink-soft">(optional)</span>
        </span>
        <textarea
          name="instructions"
          rows={3}
          value={draft.instructions}
          onChange={(event) => onChange({ instructions: event.target.value })}
          placeholder="What buyers should do after paying…"
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-2 rounded-2xl border-2 border-ink/15 bg-surface p-3">
        <button
          type="button"
          role="switch"
          aria-checked={draft.isActive}
          onClick={() => onChange({ isActive: !draft.isActive })}
          className="flex items-center justify-between gap-4 text-sm font-semibold"
        >
          Active
          <span
            className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-ink transition-colors duration-300 ease-brutal ${
              draft.isActive ? "bg-brand" : "bg-paper"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full border-2 border-ink bg-paper transition-all duration-300 ease-brutal ${
                draft.isActive ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
        </button>
        <p className="text-xs text-ink-soft">
          {draft.isActive
            ? "Buyers can pick this method at checkout."
            : "Hidden from buyers; only organizers can see it."}
        </p>
      </div>
    </div>
  );
}
