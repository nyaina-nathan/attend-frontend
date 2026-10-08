import { getCurrentUser } from "@/app/lib/auth";
import Button from "../ui/Button";
import { ArrowUpRight } from "../ui/icons";

/** Auth-only "Create an event" action. Renders behind `<Suspense>`. */
export default async function CreateEventButton() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <Button href="/events/new" variant="accent" icon={<ArrowUpRight className="h-4 w-4" />}>
      Create an event
    </Button>
  );
}
