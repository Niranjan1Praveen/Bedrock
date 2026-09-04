import type { HappinessSite } from "@/content/happiness";
import { MonoLabel } from "@/components/ui/mono-label";

/**
 * The Ellipsis of Happiness work, as a row of cards.
 *
 * Cards rather than the hairline-row list used for Selected Work, deliberately:
 * these three sit outside that numbered sequence, and giving them a different
 * shape is what stops them reading as more of the same list. The card is the
 * same bordered, rounded panel the tracks and detail pages already use.
 *
 * Each card is one link to the running site. There are no repository links
 * because those repositories are private -- see content/happiness.ts.
 *
 * A server component: nothing here needs to reach the browser.
 */
export function Happiness({ sites }: { sites: HappinessSite[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {sites.map((site) => (
        <a
          key={site.host}
          href={site.live}
          target="_blank"
          rel="noreferrer noopener"
          className="group border-line hover:border-ink-subtle hover:bg-surface flex min-w-0 flex-col rounded-xl border p-7 transition-colors"
        >
          <MonoLabel>{site.kind}</MonoLabel>

          <h3 className="text-ink mt-5 text-2xl">{site.name}</h3>

          <p className="text-ink-muted mt-4 flex-1 leading-relaxed">
            {site.summary}
          </p>

          <ul className="mt-7 flex flex-wrap gap-1.5">
            {site.stack.map((tech) => (
              <li
                key={tech}
                className="mono-label border-line text-ink-subtle rounded border px-2 py-1"
              >
                {tech}
              </li>
            ))}
          </ul>

          <span className="border-line text-ink-subtle group-hover:text-ink mt-7 flex items-baseline justify-between gap-4 border-t pt-5 font-mono text-[0.8125rem] tracking-[0.1em] transition-colors">
            <span className="truncate">{site.host}</span>
            <span aria-hidden>&rarr;</span>
          </span>
        </a>
      ))}
    </div>
  );
}
