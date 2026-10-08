import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";
import Section from "../ui/Section";
import { ArrowUpRight, Check } from "../ui/icons";
import TicketCard from "./TicketCard";

const proofPoints = ["Atomic QR check-in", "No overselling", "Tiers in seconds"];

export default function Hero() {
  return (
    <Section
      tone="brand"
      className="overflow-hidden pt-16 sm:pt-20 lg:pt-24"
    >
      <div
        aria-hidden="true"
        className="grid-paper absolute inset-0 opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-2 border-ink bg-accent/20"
      />

      <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="flex flex-col items-start gap-6">
          <Eyebrow>Events &amp; ticketing, end to end</Eyebrow>

          <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Create events.
            <br />
            Sell tickets.
            <br />
            Scan at the door.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-ink/80 sm:text-lg">
            Spin up an event, sell multiple ticket tiers without overselling,
            and check guests in with an atomic QR scan — all from one
            dashboard.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href="/events"
              variant="accent"
              size="lg"
              icon={<ArrowUpRight className="h-4 w-4" />}
            >
              Browse events
            </Button>
            <Button href="/register" variant="outline" size="lg">
              Create an event
            </Button>
          </div>

          <ul className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
            {proofPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-paper">
                  <Check className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="flex justify-center lg:justify-end">
          <div className="animate-float">
            <TicketCard />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
