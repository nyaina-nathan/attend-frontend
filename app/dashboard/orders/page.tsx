import type { Metadata } from "next";
import { Suspense } from "react";
import OrdersFilterBar from "@/app/components/orders/OrdersFilterBar";
import OrdersHeader from "@/app/components/orders/OrdersHeader";
import OrdersResults from "@/app/components/orders/OrdersResults";
import OrdersSkeleton, {
  OrdersFilterBarSkeleton,
} from "@/app/components/orders/OrdersSkeleton";
import type { RawSearchParams } from "@/app/lib/orders-query";

export const metadata: Metadata = {
  title: "My orders",
  description:
    "Every ticket order you’ve placed — with its payment method and review status.",
};

/**
 * The caller's ticket orders. The shell prerenders; the filter bar and the
 * `searchParams`/session-dependent list stream behind `<Suspense>`.
 */
export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <OrdersHeader />

      <div className="mt-10">
        <Suspense fallback={<OrdersFilterBarSkeleton />}>
          <OrdersFilterBar />
        </Suspense>
      </div>

      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
