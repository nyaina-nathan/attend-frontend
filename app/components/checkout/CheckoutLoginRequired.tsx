import Link from "next/link";
import { Lock } from "../ui/icons";

/**
 * Gate shown to anonymous visitors on `/checkout`. Their cart is local to the
 * browser, so it survives the trip through login — the link returns them here.
 */
export default function CheckoutLoginRequired() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl border-2 border-ink bg-paper p-6 shadow-brutal sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-accent-soft">
        <Lock className="h-5 w-5" />
      </span>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Log in to check out
      </h1>
      <p className="max-w-md text-base leading-relaxed text-ink-soft">
        You need an account to place an order. Your cart is saved, so you’ll come
        right back here after logging in.
      </p>
      <Link
        href="/login?next=/checkout"
        className="mt-2 inline-flex items-center rounded-full border-2 border-ink bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Log in
      </Link>
    </div>
  );
}
