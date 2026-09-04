import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { Pill } from "@/components/ui/pill";
import { ProjectArt } from "@/components/home/project-art";
import { projects } from "@/content/projects";

/** Static content, no database -- every project is prerendered at build. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Not found" };

  return {
    title: project.name,
    description: project.summary,
    openGraph: {
      title: project.name,
      description: project.summary,
      type: "article",
      // Conditional, so a project without a poster falls back to the site's
      // own defaults rather than emitting a URL that resolves to nothing.
      images: project.image
        ? [
            {
              url: project.image,
              width: 2400,
              height: 1350,
              alt: `${project.name} — ${project.subtitle}`,
            },
          ]
        : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <Container className="py-12 sm:py-16">
      <nav className="mono-label text-ink-subtle">
        <Link href="/#selected-work" className="hover:text-ink transition-colors">
          Selected work
        </Link>
      </nav>

      <header className="mt-6 max-w-3xl">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-3xl leading-snug sm:text-4xl">{project.name}</h1>
          <MonoLabel>{project.year}</MonoLabel>
        </div>

        <p className="text-ink-muted mt-4 text-lg leading-relaxed">
          {project.subtitle}
        </p>

        {project.award && (
          <Pill tone="accent" className="mt-5">
            {project.award}
          </Pill>
        )}
      </header>

      <div className="border-line bg-surface mt-10 aspect-video overflow-hidden rounded-xl border">
        <ProjectArt project={project} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0">
          <h2 className="mono-label text-ink-subtle">What it does</h2>
          <p className="text-ink-muted mt-3 leading-relaxed">
            {project.summary}
          </p>

          <h2 className="mono-label text-ink-subtle mt-8">What I built</h2>
          <p className="text-ink-muted mt-3 leading-relaxed">{project.role}</p>
        </div>

        <div className="min-w-0">
          <h2 className="mono-label text-ink-subtle">Stack</h2>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="mono-label border-line text-ink-subtle rounded border px-2 py-1"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div className="border-line mt-8 flex gap-5 border-t pt-6">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="mono-label text-ink hover:text-ink-muted transition-colors"
              >
                Open &rarr;
              </a>
            )}
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="mono-label text-ink-subtle hover:text-ink transition-colors"
            >
              Source &rarr;
            </a>
          </div>

          {project.related && (
            <div className="border-line mt-8 border-t pt-6">
              <MonoLabel>Also part of this</MonoLabel>
              <ul className="mt-3 space-y-1.5">
                {project.related.map((r) => (
                  <li key={r.repo}>
                    <a
                      href={r.repo}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-ink-subtle hover:text-ink text-sm transition-colors"
                    >
                      {r.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <footer className="border-line mt-16 border-t pt-8">
        <Link
          href="/#selected-work"
          className="mono-label text-ink-subtle hover:text-ink transition-colors"
        >
          &larr; Back to home
        </Link>
      </footer>
    </Container>
  );
}
