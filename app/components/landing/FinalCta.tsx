import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import Section from "../ui/Section";
import { ArrowUpRight } from "../ui/icons";

export default function FinalCta() {
  return (
    <Section tone="accent" className="overflow-hidden">
      <div className="grid-paper-light absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-2 border-paper/20 bg-brand/20"
      />

      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
          Create your first event today
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-paper/80 sm:text-lg">
          Set it up in minutes, share the link, and scan your first guest in
          tonight.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            href="/register"
            variant="primary"
            size="lg"
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            Create your first event
          </Button>
          <Button href="/events" variant="outline" size="lg">
            Browse events
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
