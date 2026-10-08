"use client";

import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import { ArrowUpRight } from "../ui/icons";
import { useMounted } from "../events/useMounted";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Greeting + the dashboard's only primary action. The time-of-day greeting is
 * derived after mount (the server can't know the visitor's clock), with a
 * neutral fallback so server and first client render match.
 */
export default function DashboardHeader({ fullName }: { fullName: string }) {
  const mounted = useMounted();
  const greeting = mounted ? greetingFor(new Date().getHours()) : "Hello";

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4">
        <Eyebrow className="self-start">Dashboard</Eyebrow>
        <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl">
          {greeting}, {fullName}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Here’s what needs your attention today.
        </p>
      </div>
      <Button
        href="/events/new"
        variant="accent"
        size="lg"
        className="shrink-0"
        icon={<ArrowUpRight className="h-4 w-4" />}
      >
        Create event
      </Button>
    </div>
  );
}
