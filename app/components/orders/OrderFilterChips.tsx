import Link from "next/link";
import {
  orderChipsFromParams,
  removeOrderFilterHref,
} from "@/app/lib/orders-query";
import { X } from "../ui/icons";

/** Active-filter chips + the total count for the orders list. */
export default function OrderFilterChips({
  params,
  total,
}: {
  params: Record<string, string>;
  total: number;
}) {
  const chips = orderChipsFromParams(params);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">
        {total} {total === 1 ? "order" : "orders"}
      </span>

      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={removeOrderFilterHref(params, chip.remove)}
          scroll={false}
          className="group inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:-translate-y-0.5"
        >
          {chip.label}
          <X className="h-3.5 w-3.5 text-ink-soft transition-colors duration-300 ease-brutal group-hover:text-danger" />
        </Link>
      ))}
    </div>
  );
}
