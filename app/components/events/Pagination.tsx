import Link from "next/link";
import { buildEventsHref } from "@/app/lib/events-query";
import { ArrowRight } from "../ui/icons";

function pageWindow(current: number, total: number): (number | "…")[] {
  const candidates = new Set<number>([0, total - 1, current - 1, current, current + 1]);
  const valid = [...candidates]
    .filter((page) => page >= 0 && page < total)
    .sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let previous = -1;
  for (const page of valid) {
    if (previous !== -1 && page - previous > 1) result.push("…");
    result.push(page);
    previous = page;
  }
  return result;
}

const base =
  "inline-flex h-11 min-w-10 items-center justify-center rounded-xl border-2 border-ink px-3 text-sm font-semibold transition-all duration-500 ease-brutal sm:h-10";

export default function Pagination({
  params,
  page,
  totalPages,
}: {
  params: Record<string, string>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(page, 0), totalPages - 1);

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {current > 0 ? (
        <Link
          href={buildEventsHref(params, current - 1)}
          aria-label="Previous page"
          className={`${base} bg-paper shadow-brutal-sm hover:-translate-y-0.5`}
        >
          <ArrowRight className="h-4 w-4 rotate-180 sm:hidden" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} border-ink/30 text-ink-soft/60`}>
          <ArrowRight className="h-4 w-4 rotate-180 sm:hidden" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {pageWindow(current, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-soft">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildEventsHref(params, item)}
            aria-current={item === current ? "page" : undefined}
            aria-label={`Page ${item + 1}`}
            className={`${base} ${
              item === current ? "bg-brand shadow-brutal" : "bg-paper shadow-brutal-sm hover:-translate-y-0.5"
            }`}
          >
            {item + 1}
          </Link>
        ),
      )}

      {current < totalPages - 1 ? (
        <Link
          href={buildEventsHref(params, current + 1)}
          aria-label="Next page"
          className={`${base} bg-paper shadow-brutal-sm hover:-translate-y-0.5`}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-4 w-4 sm:hidden" />
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} border-ink/30 text-ink-soft/60`}>
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-4 w-4 sm:hidden" />
        </span>
      )}
    </nav>
  );
}
