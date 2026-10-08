import Eyebrow from "../ui/Eyebrow";
import Logo from "../ui/Logo";
import { Check, Layers, QrCode, Shield } from "../ui/icons";

const proofPoints = ["Atomic QR check-in", "No overselling", "Tiers in seconds"];

const highlights = [
  {
    icon: <QrCode className="h-5 w-5" />,
    title: "QR tickets & instant check-in",
    body: "Every scan is atomic, so a ticket can never be checked in twice.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Multiple ticket tiers",
    body: "Live remaining capacity per tier keeps you from ever overselling.",
  },
];

/**
 * Informational half of the auth shell. Pulls the story straight from the
 * landing page so /login and /register sit inside the same visual world.
 * Collapses to a compact brand banner on small screens.
 */
export default function AuthAside() {
  return (
    <aside className="relative overflow-hidden bg-ink text-paper">
      <div
        aria-hidden="true"
        className="grid-paper-light pointer-events-none absolute inset-0 opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-2 border-paper/10 bg-accent/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full border-2 border-paper/10 bg-brand/20"
      />

      <div className="relative flex h-full flex-col gap-8 px-6 py-10 sm:px-10 lg:justify-between lg:px-14 lg:py-16">
        <Logo tone="light" />

        <div className="flex flex-col gap-6">
          <Eyebrow tone="light">Events &amp; ticketing, end to end</Eyebrow>

          <h1 className="max-w-lg font-display text-3xl font-bold leading-[1.02] tracking-tight sm:text-4xl lg:text-5xl">
            Create events.
            <br />
            Sell tickets.
            <br />
            Scan at the door.
          </h1>

          <p className="hidden max-w-md text-base leading-relaxed text-paper/75 sm:block">
            Spin up an event, sell multiple ticket tiers without overselling,
            and check guests in with an atomic QR scan — all from one dashboard.
          </p>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {proofPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-paper bg-brand text-ink">
                  <Check className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <ul className="hidden flex-col gap-4 lg:flex">
          {highlights.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-paper bg-brand text-ink">
                {item.icon}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-display text-sm font-bold">
                  {item.title}
                </span>
                <span className="text-xs leading-relaxed text-paper/70">
                  {item.body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
