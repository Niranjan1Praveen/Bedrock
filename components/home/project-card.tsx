import type { Project } from "@/content/projects";
import { MonoLabel } from "@/components/ui/mono-label";

/**
 * One project.
 *
 * The whole card is not a link, because a project has two destinations that
 * matter equally: the running thing and the source. Both are named explicitly
 * rather than hidden behind a click on the title.
 */
export function ProjectCard({
  project,
  showRelated = false,
}: {
  project: Project;
  showRelated?: boolean;
}) {
  return (
    <article className="border-line flex flex-col rounded-xl border p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg">{project.name}</h3>
        <MonoLabel className="shrink-0">{project.year}</MonoLabel>
      </div>

      <p className="text-ink-muted mt-1.5 text-sm">{project.subtitle}</p>

      {project.award && (
        <p className="mono-label text-accent mt-4">{project.award}</p>
      )}

      <p className="text-ink-muted mt-4 text-sm leading-relaxed">
        {project.summary}
      </p>
      <p className="text-ink-subtle mt-3 text-sm leading-relaxed">
        {project.role}
      </p>

      <ul className="my-4 flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="mono-label border-line text-ink-subtle rounded border px-2 py-1"
          >
            {tech}
          </li>
        ))}
      </ul>

      {showRelated && project.related && (
        <div className="border-line mt-5 border-t pt-4">
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

      {/* Pushed to the bottom so cards in a row line their links up. */}
      <div className="border-line mt-auto flex gap-5 border-t pt-5">
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
    </article>
  );
}
