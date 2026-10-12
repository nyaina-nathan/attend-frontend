import type { TierCreateInput } from "./types";

/**
 * Client-side state and validation for the create-event wizard. Kept apart from
 * the components so the rules stay easy to read and reuse; the API re-validates
 * everything server-side.
 */

export interface EventDraft {
  title: string;
  description: string;
  location: string;
  isPublic: boolean;
  /** Free-form currency/unit code labelling every amount on the event. */
  priceUnit: string;
  /** Local `datetime-local` value (`YYYY-MM-DDTHH:mm`). */
  startTime: string;
  /** Local `datetime-local` value (`YYYY-MM-DDTHH:mm`). */
  endTime: string;
}

export interface TierDraft {
  tierName: string;
  price: string;
  capacity: string;
}

export function emptyEventDraft(): EventDraft {
  return {
    title: "",
    description: "",
    location: "",
    isPublic: true,
    priceUnit: "USD",
    startTime: "",
    endTime: "",
  };
}

export function emptyTierDraft(): TierDraft {
  return { tierName: "", price: "", capacity: "" };
}

export type EventErrors = Partial<Record<keyof EventDraft, string>>;

function parseLocal(value: string): number | undefined {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}

/** Validate the event step. Returns a map of field -> message (empty when valid). */
export function validateEventDraft(draft: EventDraft): EventErrors {
  const errors: EventErrors = {};

  if (!draft.title.trim()) errors.title = "Give your event a title.";

  if (draft.priceUnit.trim().length > 10) {
    errors.priceUnit = "Keep the unit to 10 characters or fewer.";
  }

  const start = parseLocal(draft.startTime);
  const end = parseLocal(draft.endTime);
  if (start === undefined) errors.startTime = "Pick a start date and time.";
  if (end === undefined) errors.endTime = "Pick an end date and time.";
  if (start !== undefined && end !== undefined && end <= start) {
    errors.endTime = "The end must be after the start.";
  }

  return errors;
}

/** A tier row is ignorable when every field is still empty. */
export function isBlankTier(tier: TierDraft): boolean {
  return !tier.tierName.trim() && !tier.price.trim() && !tier.capacity.trim();
}

export interface TierValidation {
  /** Row index -> message. */
  errors: Record<number, string>;
  /** The API-ready tiers; blank rows are dropped. */
  payload: TierCreateInput[];
}

/** Validate the tier step. Blank rows are ignored; partial rows are errors. */
export function validateTierDrafts(tiers: TierDraft[]): TierValidation {
  const errors: Record<number, string> = {};
  const payload: TierCreateInput[] = [];

  tiers.forEach((tier, index) => {
    if (isBlankTier(tier)) return;

    const tierName = tier.tierName.trim();
    if (!tierName) {
      errors[index] = "Give this tier a name.";
      return;
    }

    const price = Number(tier.price);
    if (tier.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      errors[index] = "Enter a price of 0 or more.";
      return;
    }

    const capacity = Number(tier.capacity);
    if (
      tier.capacity.trim() === "" ||
      !Number.isInteger(capacity) ||
      capacity < 0
    ) {
      errors[index] = "Enter a whole capacity of 0 or more.";
      return;
    }

    payload.push({ tierName, price, capacity });
  });

  return { errors, payload };
}
