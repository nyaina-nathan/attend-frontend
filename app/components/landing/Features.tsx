import Reveal from "../ui/Reveal";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import {
  Chart,
  Globe,
  Layers,
  QrCode,
  Shield,
  Users,
} from "../ui/icons";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: <QrCode className="h-6 w-6" />,
    title: "QR tickets & instant check-in",
    body: "Every scan is atomic, so a ticket can never be checked in twice.",
    tone: "brand" as const,
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Multiple ticket tiers",
    body: "Live remaining capacity per tier keeps you from ever overselling.",
    tone: "accent" as const,
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Team roles per event",
    body: "Invite creators and admins with permissions scoped to each event.",
    tone: "brand" as const,
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Public or private events",
    body: "List events for discovery or keep them invite-only for your crowd.",
    tone: "accent" as const,
  },
  {
    icon: <Chart className="h-6 w-6" />,
    title: "Organizer dashboard",
    body: "Track tickets issued, checked in, and revenue at a glance.",
    tone: "brand" as const,
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure sessions",
    body: "HttpOnly cookies with refresh token rotation keep accounts safe.",
    tone: "accent" as const,
  },
];

export default function Features() {
  return (
    <Section id="features" tone="ink" className="overflow-hidden">
      <div className="grid-paper-light absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative">
        <SectionHeading
          eyebrow="Features"
          tone="light"
          title="Everything you need to run the door"
          description="Built for the messy reality of live events — fast scans, honest capacity, and clear numbers."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 60}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                body={feature.body}
                tone={feature.tone}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
