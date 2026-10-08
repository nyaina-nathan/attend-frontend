import Reveal from "../ui/Reveal";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import { ArrowUpRight, Document, Github } from "../ui/icons";

const stack = ["Spring Boot", "PostgreSQL", "Next.js", "REST API"];

const resources = [
  {
    icon: <Github className="h-5 w-5" />,
    title: "Source code",
    body: "Browse the full front end and API on GitHub.",
    href: "https://github.com/attend-app/attend",
  },
  {
    icon: <Document className="h-5 w-5" />,
    title: "API documentation",
    body: "Explore every endpoint in the OpenAPI reference.",
    href: "https://github.com/attend-app/attend/blob/main/docs/openapi.yaml",
  },
];

export default function AboutProject() {
  return (
    <Section id="about" tone="paper">
      <SectionHeading
        eyebrow="About this project"
        title="A full-stack portfolio build"
        description="An events and ticketing platform built end to end — from an atomic check-in backend to this landing page."
      />

      <div className="mt-10 flex flex-wrap gap-3">
        {stack.map((item) => (
          <span
            key={item}
            className="rounded-full border-2 border-ink bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {resources.map((resource, index) => (
          <Reveal key={resource.title} delay={index * 80}>
            <a
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full items-start gap-4 rounded-2xl border-2 border-ink bg-paper p-6 shadow-brutal transition-all duration-500 ease-brutal hover:-translate-y-1.5 hover:shadow-brutal-lg"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-brand">
                {resource.icon}
              </span>
              <span className="flex flex-1 flex-col gap-1">
                <span className="flex items-center gap-2 font-display text-lg font-bold">
                  {resource.title}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-brutal group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="text-sm text-ink-soft">{resource.body}</span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
