import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import { Calendar } from "../ui/icons";

/** Page header for the invitations list. */
export default function InvitationsHeader() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4">
        <Eyebrow className="self-start">Dashboard</Eyebrow>
        <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl">
          Invitations
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Invitations to help organize an event. Accept the ones you want, and
          keep track of the ones you’ve sent.
        </p>
      </div>
      <Button
        href="/dashboard/events"
        variant="outline"
        className="shrink-0"
        icon={<Calendar className="h-4 w-4" />}
      >
        My events
      </Button>
    </div>
  );
}
