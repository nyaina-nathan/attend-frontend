import type {
  PaymentMethod,
  PaymentMethodCreateInput,
  PaymentMethodUpdateInput,
  PaymentType,
} from "./types";

/**
 * Client-side state and validation for payment methods. Kept apart from the
 * server fetch in `event.ts` so client components can import these helpers
 * without pulling in `next/headers`. The API re-validates everything.
 */

/** Display order and labels for the `PaymentType` enum. */
export const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "CARD", label: "Card" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "CASH", label: "Cash" },
  { value: "OTHER", label: "Other" },
];

export function paymentTypeLabel(type: PaymentType): string {
  return PAYMENT_TYPES.find((entry) => entry.value === type)?.label ?? type;
}

export interface PaymentMethodDraft {
  paymentType: PaymentType;
  providerName: string;
  accountName: string;
  accountIdentifier: string;
  routingDetails: string;
  instructions: string;
  isActive: boolean;
}

export function emptyPaymentMethodDraft(): PaymentMethodDraft {
  return {
    paymentType: "BANK_TRANSFER",
    providerName: "",
    accountName: "",
    accountIdentifier: "",
    routingDetails: "",
    instructions: "",
    isActive: true,
  };
}

/** Seed an editable draft from an existing method. */
export function paymentMethodDraftFromMethod(
  method: PaymentMethod,
): PaymentMethodDraft {
  return {
    paymentType: method.paymentType,
    providerName: method.providerName,
    accountName: method.accountName,
    accountIdentifier: method.accountIdentifier,
    routingDetails: method.routingDetails ?? "",
    instructions: method.instructions ?? "",
    isActive: method.isActive,
  };
}

/** A payment method row is ignorable when every text field is still empty. */
export function isBlankPaymentMethod(draft: PaymentMethodDraft): boolean {
  return (
    !draft.providerName.trim() &&
    !draft.accountName.trim() &&
    !draft.accountIdentifier.trim() &&
    !draft.routingDetails.trim() &&
    !draft.instructions.trim()
  );
}

export interface PaymentMethodValidation {
  /** Row index -> message. */
  errors: Record<number, string>;
  /** The API-ready methods; blank rows are dropped. */
  payload: PaymentMethodCreateInput[];
}

/** Validate the payment-method rows. Blank rows are ignored; partial rows error. */
export function validatePaymentMethodDrafts(
  drafts: PaymentMethodDraft[],
): PaymentMethodValidation {
  const errors: Record<number, string> = {};
  const payload: PaymentMethodCreateInput[] = [];

  drafts.forEach((draft, index) => {
    if (isBlankPaymentMethod(draft)) return;

    const providerName = draft.providerName.trim();
    if (!providerName) {
      errors[index] = "Name the provider or bank.";
      return;
    }
    if (providerName.length > 100) {
      errors[index] = "Keep the provider name to 100 characters or fewer.";
      return;
    }

    const accountName = draft.accountName.trim();
    if (!accountName) {
      errors[index] = "Enter the account holder name.";
      return;
    }
    if (accountName.length > 150) {
      errors[index] = "Keep the account name to 150 characters or fewer.";
      return;
    }

    const accountIdentifier = draft.accountIdentifier.trim();
    if (!accountIdentifier) {
      errors[index] = "Enter the account number or identifier.";
      return;
    }
    if (accountIdentifier.length > 100) {
      errors[index] = "Keep the account identifier to 100 characters or fewer.";
      return;
    }

    const routingDetails = draft.routingDetails.trim();
    if (routingDetails.length > 100) {
      errors[index] = "Keep the routing details to 100 characters or fewer.";
      return;
    }

    payload.push({
      paymentType: draft.paymentType,
      providerName,
      accountName,
      accountIdentifier,
      isActive: draft.isActive,
      ...(routingDetails ? { routingDetails } : {}),
      ...(draft.instructions.trim()
        ? { instructions: draft.instructions.trim() }
        : {}),
    });
  });

  return { errors, payload };
}

/**
 * Validate a single method for the edit dialog: the same rules as create, but a
 * fully blank row is an error too (there is nothing to save).
 */
export function validatePaymentMethodUpdate(
  draft: PaymentMethodDraft,
): string | null {
  if (isBlankPaymentMethod(draft)) return "Fill in the payment method details.";

  const { errors } = validatePaymentMethodDrafts([draft]);
  return errors[0] ?? null;
}

/** Build a partial `PaymentMethodUpdateRequest` with only the fields that changed. */
export function buildPaymentMethodUpdateInput(
  initial: PaymentMethodDraft,
  draft: PaymentMethodDraft,
): PaymentMethodUpdateInput {
  const input: PaymentMethodUpdateInput = {};

  if (draft.paymentType !== initial.paymentType) {
    input.paymentType = draft.paymentType;
  }

  const providerName = draft.providerName.trim();
  if (providerName !== initial.providerName.trim()) {
    input.providerName = providerName;
  }

  const accountName = draft.accountName.trim();
  if (accountName !== initial.accountName.trim()) {
    input.accountName = accountName;
  }

  const accountIdentifier = draft.accountIdentifier.trim();
  if (accountIdentifier !== initial.accountIdentifier.trim()) {
    input.accountIdentifier = accountIdentifier;
  }

  const routingDetails = draft.routingDetails.trim();
  if (routingDetails !== initial.routingDetails.trim()) {
    input.routingDetails = routingDetails;
  }

  const instructions = draft.instructions.trim();
  if (instructions !== initial.instructions.trim()) {
    input.instructions = instructions;
  }

  if (draft.isActive !== initial.isActive) {
    input.isActive = draft.isActive;
  }

  return input;
}
