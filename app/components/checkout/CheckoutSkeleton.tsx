/** Placeholder shown while the checkout page resolves its session and cart. */
export default function CheckoutSkeleton() {
  return (
    <div aria-label="Loading checkout" className="flex flex-col gap-6">
      <div className="h-8 w-48 animate-pulse rounded bg-ink/10" />
      <div className="h-4 w-72 animate-pulse rounded bg-ink/10" />
      <div className="h-64 animate-pulse rounded-3xl border-2 border-ink/10 bg-ink/5" />
      <div className="h-64 animate-pulse rounded-3xl border-2 border-ink/10 bg-ink/5" />
    </div>
  );
}
