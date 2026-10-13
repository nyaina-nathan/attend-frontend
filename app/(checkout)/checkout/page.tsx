import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutContent from "@/app/components/checkout/CheckoutContent";
import CheckoutLoginRequired from "@/app/components/checkout/CheckoutLoginRequired";
import CheckoutSkeleton from "@/app/components/checkout/CheckoutSkeleton";
import { getCurrentUser } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Choose a payment method and place your ticket order for the events in your cart.",
};

/**
 * Checkout route (`/checkout`). The cart is client-side, so the body is a
 * client component; the server gate only resolves the session. Anonymous
 * visitors get a log-in prompt that returns them here, cart intact.
 */
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutGate />
    </Suspense>
  );
}

async function CheckoutGate() {
  const user = await getCurrentUser();
  if (!user) return <CheckoutLoginRequired />;
  return <CheckoutContent />;
}
