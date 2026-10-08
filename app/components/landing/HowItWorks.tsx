import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import HowItWorksTabs from "./HowItWorksTabs";

export default function HowItWorks() {
  return (
    <Section id="how-it-works" tone="paper">
      <SectionHeading
        eyebrow="How it works"
        title="Three steps, whichever side you're on"
        description="Whether you're buying a ticket or running the show, the flow stays short and obvious."
      />
      <HowItWorksTabs />
    </Section>
  );
}
