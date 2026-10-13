import type { ReactNode } from "react";
import Footer from "../components/site/Footer";
import Navbar from "../components/site/Navbar";

/**
 * Checkout shell: the public navbar (with the cart) and footer around a narrow
 * column, so the purchase form keeps all of the site chrome.
 */
export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pt-28 pb-24 sm:pt-32">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
