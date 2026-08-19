import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { ProjectCard } from "@/components/home/project-card";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Projects",
  description: `Projects built by ${profile.name}, with source and a running demo for each.`,
};

export default function ProjectsPage() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Container className="py-16 sm:py-24">
      <MonoLabel>Projects</MonoLabel>
      <h1 className="mt-4 max-w-2xl text-3xl sm:text-4xl">
        Everything I have built and shipped.
      </h1>
      <p className="text-ink-muted mt-5 max-w-xl leading-relaxed">
        Each one links to its source and, where it is deployed, to the running
        application.
      </p>

      <section className="mt-16">
        <MonoLabel>Selected</MonoLabel>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} showRelated />
          ))}
        </div>
      </section>

      <section className="border-line mt-16 border-t pt-14">
        <MonoLabel>Other work</MonoLabel>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {rest.map((p) => (
            <ProjectCard key={p.slug} project={p} showRelated />
          ))}
        </div>
      </section>

      <p className="text-ink-subtle mt-14 text-sm">
        Smaller experiments and course work are on{" "}
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer noopener"
          className="text-ink-muted hover:text-ink underline underline-offset-4 transition-colors"
        >
          GitHub
        </a>
        .
      </p>
    </Container>
  );
}
