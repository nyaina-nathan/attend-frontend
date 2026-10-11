import { validateTierDrafts, type TierDraft } from "./create-event";
import type { Tier, TierUpdateInput } from "./types";

/**
 * Client-side mapping for the edit-tier dialog. The draft mirrors
 * `TierCreateInput` but keeps every value as a string for the form inputs; the
 * API's own rules are re-checked server-side.
 */

/** Seed an editable draft from an existing tier. */
export function tierDraftFromTier(tier: Tier): TierDraft {
  return {
    tierName: tier.tierName,
    price: String(tier.price),
    capacity: String(tier.capacity),
  };
}

/**
 * Tickets already claimed for a tier (`VALID` or `USED`). `remaining` only
 * excludes those, so this can't be read off `remaining === 0` alone.
 */
export function issuedCount(tier: Tier): number {
  return Math.max(0, tier.capacity - tier.remaining);
}

/**
 * Validate the edit-tier draft: the same rules as create (name, price, whole
 * capacity) plus the API's `409` rule that capacity can't drop below the number
 * of tickets already issued. Returns a message, or `null` when valid.
 */
export function validateTierUpdate(
  draft: TierDraft,
  issued: number,
): string | null {
  const { errors, payload } = validateTierDrafts([draft]);
  if (errors[0]) return errors[0];
  if (payload.length === 0) return "Fill in the tier details.";

  if (payload[0].capacity < issued) {
    return `Capacity can’t be lower than the ${issued} ticket${
      issued === 1 ? "" : "s"
    } already issued.`;
  }

  return null;
}

/** Build a partial `TierUpdateRequest` with only the fields that changed. */
export function buildTierUpdateInput(
  initial: TierDraft,
  draft: TierDraft,
): TierUpdateInput {
  const input: TierUpdateInput = {};

  const tierName = draft.tierName.trim();
  if (tierName !== initial.tierName.trim()) input.tierName = tierName;

  const price = Number(draft.price);
  if (draft.price.trim() !== "" && price !== Number(initial.price)) {
    input.price = price;
  }

  const capacity = Number(draft.capacity);
  if (draft.capacity.trim() !== "" && capacity !== Number(initial.capacity)) {
    input.capacity = capacity;
  }

  return input;
}
