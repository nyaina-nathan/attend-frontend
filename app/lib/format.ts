/** Display formatting helpers. */

/** Up to two uppercase initials for an avatar placeholder, e.g. `Ada Lovelace` -> `AL`. */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export function formatEventDate(startISO: string, endISO?: string): string {
  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) return "";

  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(start);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(start);

  if (endISO) {
    const end = new Date(endISO);
    const sameDay =
      !Number.isNaN(end.getTime()) &&
      start.toDateString() === end.toDateString();
    if (sameDay) {
      const endTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(end);
      return `${date} · ${time} – ${endTime}`;
    }
  }

  return `${date} · ${time}`;
}

export function formatEventDay(
  startISO: string,
  timeZone?: string,
): { day: string; month: string } {
  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) return { day: "", month: "" };
  return {
    day: new Intl.DateTimeFormat("en-US", { day: "2-digit", timeZone }).format(start),
    month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone })
      .format(start)
      .toUpperCase(),
  };
}

/**
 * Weekday + date + time, e.g. `Sat, Nov 20 · 6:00 PM`. Pass a `timeZone` (or
 * `"UTC"` before mount) to keep server and client labels identical.
 */
export function formatEventDateTime(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
  }).format(date);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(date);

  return `${day} · ${time}`;
}

/** Formatter per unit code, or `null` when the unit isn't an ISO-4217 code. */
const priceFormatters = new Map<string, Intl.NumberFormat | null>();

function currencyFormatter(unit: string): Intl.NumberFormat | null {
  const cached = priceFormatters.get(unit);
  if (cached !== undefined) return cached;

  let formatter: Intl.NumberFormat | null = null;
  try {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: unit,
      maximumFractionDigits: 2,
    });
  } catch {
    // Not an ISO-4217 code (free-form unit): fall back to a plain number.
    formatter = null;
  }
  priceFormatters.set(unit, formatter);
  return formatter;
}

const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Price label for an event amount. Known ISO-4217 units use a currency symbol
 * (`$25.00`, `€25.00`); free-form units are appended as a code (`25.00 PTS`).
 * Defaults to `USD` so callers that don't know the unit stay unchanged.
 */
export function formatPrice(
  amount: number | null | undefined,
  unit: string = "USD",
): string {
  if (amount == null || amount <= 0) return "Free";

  const code = unit.trim().toUpperCase() || "USD";
  const formatter = currencyFormatter(code);
  if (formatter) return formatter.format(amount);

  return `${decimalFormatter.format(amount)} ${code}`;
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

/** Currency for dashboard totals; always two decimals, e.g. `$3,450.00`. */
export function formatMoney(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

const integerFormatter = new Intl.NumberFormat("en-US");

/** Grouped integer for stat tiles, e.g. `1,204`. */
export function formatCount(value: number): string {
  return integerFormatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * Human phrase for a future instant, relative to `now` (passed in so server and
 * client can share it). Returns `in 4 days`, `tomorrow`, `in 3 hours`, `in a
 * minute`, or `now` when the instant has passed.
 */
export function formatRelativeToNow(iso: string, now: number): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return "soon";

  const diff = target - now;
  if (diff <= 0) return "now";

  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return minutes <= 1 ? "in a minute" : `in ${minutes} minutes`;

  const hours = Math.round(diff / 3_600_000);
  if (hours < 24) return hours <= 1 ? "in an hour" : `in ${hours} hours`;

  const days = Math.round(diff / 86_400_000);
  if (days === 1) return "tomorrow";
  if (days < 30) return `in ${days} days`;

  const months = Math.round(days / 30);
  if (months < 12) return months <= 1 ? "next month" : `in ${months} months`;

  const years = Math.round(months / 12);
  return years <= 1 ? "next year" : `in ${years} years`;
}

/** Countdown label for an organizer's next event: `in 3 days` / `Happening now`. */
export function formatCountdown(
  startISO: string,
  endISO: string,
  now: number,
): string {
  const start = new Date(startISO).getTime();
  if (Number.isNaN(start)) return "";
  if (now >= start) {
    const end = new Date(endISO).getTime();
    if (Number.isNaN(end) || now <= end) return "Happening now";
    return "Finished";
  }
  return formatRelativeToNow(startISO, now);
}
