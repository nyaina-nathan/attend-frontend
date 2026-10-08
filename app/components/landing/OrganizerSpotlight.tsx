import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";
import Section from "../ui/Section";
import { ArrowUpRight, Check } from "../ui/icons";
import StatsPanel from "./StatsPanel";

const points = [
  "See every ticket issued and scanned in real time",
  "Know exactly how much each event has earned",
  "Spot check-in bottlenecks while they're happening",
];

export default function OrganizerSpotlight() {
  return (
    <Section id="organizers" tone="surface">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        <Reveal className="flex flex-col items-start gap-6">
          <Eyebrow>For organizers</Eyebrow>
          <h2 className="font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
            Run the whole event from one calm dashboard
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
            No spreadsheets, no guesswork. Watch tickets move, revenue climb,
            and the door stay moving — even on the busiest night.
          </p>

          <ul className="flex flex-col gap-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-brand">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-ink/85">{point}</span>
              </li>
            ))}
          </ul>

          <Button
            href="/register"
            variant="primary"
            size="lg"
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            Start organizing
          </Button>
        </Reveal>

        <Reveal delay={120}>
          <StatsPanel />
        </Reveal>
      </div>
    </Section>
  );
}
