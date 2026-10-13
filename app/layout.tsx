import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import CartDrawerHost from "./components/cart/CartDrawerHost";
import CartProvider from "./components/cart/CartProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Attend — Create events. Sell tickets. Scan at the door.",
    template: "%s · Attend",
  },
  description:
    "Attend is an events and ticketing platform: create events, sell tickets in multiple tiers, and check guests in with QR codes at the door.",
  applicationName: "Attend",
  keywords: ["events", "tickets", "QR check-in", "ticketing", "event platform"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-surface text-ink">
        <CartProvider>
          {children}
          <CartDrawerHost />
        </CartProvider>
      </body>
    </html>
  );
}
