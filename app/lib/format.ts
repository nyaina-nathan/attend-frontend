/** Display formatting helpers. */

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

export function formatEventDay(startISO: string): { day: string; month: string } {
  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) return { day: "", month: "" };
  return {
    day: new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(start),
    month: new Intl.DateTimeFormat("en-US", { month: "short" })
      .format(start)
      .toUpperCase(),
  };
}

export function formatPrice(minPrice: number): string {
  if (minPrice <= 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(minPrice);
}
