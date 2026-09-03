import Link from "next/link";
import { MonoLabel } from "@/components/ui/mono-label";
import { Pill } from "@/components/ui/pill";
import { Viz } from "@/components/viz";
import { HideScrollbar } from "@/components/home/hide-scrollbar";
import { SmoothScroll } from "@/components/home/smooth-scroll";
import { HeroSlider } from "@/components/home/hero-slider";
import { PhysicsBalls } from "@/components/home/physics-balls";
import { Capabilities } from "@/components/home/capabilities";
import { SelectedWork } from "@/components/home/selected-work";
import { LeetCodeStats } from "@/components/home/leetcode-stats";
import { projects } from "@/content/projects";
import { capabilities, profile } from "@/content/profile";
import { getProblem, getProblems, getTracks } from "@/lib/content";
import { formatDate, getLatestPosts, type PostWithTags } from "@/lib/posts";

/**
 * Regenerated hourly rather than at build time, because the latest-posts
 * section reads the database. Everything else on this page is still static
 * content compiled from `content/`.
 */
// 60s, not an hour: see the note in app/blog/page.tsx. Publishing from
// localhost cannot clear the deployed instance's cache.
export const revalidate = 60;

/** The contact table at the foot of the page. */
const CONTACT_ROWS: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}[] = [
  {
    label: "Email",
    value: profile.links.email,
    href: `mailto:${profile.links.email}`,
  },
  {
    label: "LinkedIn",
    value: "niranjan-praveen",
    href: profile.links.linkedin,
    external: true,
  },
  {
    label: "GitHub",
    value: "Niranjan1Praveen",
    href: profile.links.github,
    external: true,
  },
  { label: "Résumé", value: "Download (PDF)", href: profile.links.resume },
  { label: "Based in", value: profile.location },
];

export default async function HomePage() {
  const [tracks, sql50, specimen, posts] = await Promise.all([
    getTracks(),
    getProblems("sql-50"),
    getProblem("sql-50", "replace-employee-id-with-the-unique-identifier"),
    // The homepage must not depend on the database being awake. A free-plan
    // Supabase project pauses after a week idle; if that happens the blog
    // section simply does not render and the rest of the page is unaffected.
    getLatestPosts(3).catch((): PostWithTags[] => []),
  ]);

  return (
    <>
      <HideScrollbar />
      <SmoothScroll />

      <PhysicsBalls />

      {/* Hero. Full-bleed rather than inside a Container: the name is set to
          the viewport width, and the ribbon runs off the right edge instead
          of stopping at a column. */}
      <section className="overflow-x-clip pt-16 pb-16 sm:pt-24 sm:pb-24">
        <div className="px-6 sm:px-10">
          <MonoLabel>{profile.role}</MonoLabel>

          {/* Sized off the viewport so it fills the width at any size, and
              capped so it stays two lines rather than one very long one.
              Heavier than the site's 400-weight headings, which is too light
              to hold together at this size.

              w-min rather than a block spanning the full max-width: width:
              fit-content (w-fit) only shrinks below an element's own unwrapped
              width, which here is one very long line, so it resolved straight
              back to max-width, leaving dead space to the right of the
              shorter word that nothing was ever drawn in -- which the physics
              balls, which collide with the real rendered box, read as a wall.
              width: min-content forces every word onto its own line and sizes
              the box to the widest one, which is what actually hugs the two
              lines here. */}
          <h1
            className="mt-8 w-min max-w-[7em] text-[clamp(3.75rem,12vw,11rem)] leading-[0.86] font-medium"
          >
            {profile.name}
          </h1>
        </div>

        {/* Copy and links sit bottom-left, the ribbon bottom-right. */}
        <div className="mt-16 grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,42%)] lg:gap-16">
          <div className="min-w-0 px-6 sm:px-10">
            <p
              className="text-ink-muted max-w-lg text-lg leading-relaxed sm:text-xl"
            >
              I build web applications and the machine learning services behind
              them. Computer science undergraduate at Amity University, Noida.
            </p>

            <div
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <a
                href={`mailto:${profile.links.email}`}
                className="text-ink hover:text-ink-muted font-mono text-[0.8125rem] font-medium tracking-[0.14em] uppercase transition-colors"
              >
                {profile.links.email}
              </a>
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink-subtle hover:text-ink font-mono text-[0.8125rem] font-medium tracking-[0.14em] uppercase transition-colors"
              >
                GitHub &rarr;
              </a>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink-subtle hover:text-ink font-mono text-[0.8125rem] font-medium tracking-[0.14em] uppercase transition-colors"
              >
                LinkedIn &rarr;
              </a>
              <a
                href={profile.links.resume}
                className="text-ink-subtle hover:text-ink font-mono text-[0.8125rem] font-medium tracking-[0.14em] uppercase transition-colors"
              >
                Résumé (PDF) &rarr;
              </a>
            </div>
          </div>

          <HeroSlider projects={projects} />
        </div>
      </section>

      {/* Capabilities. Full width, with the heading held in its own column on
          the left while the cards stack past it. No top rule -- the hero runs
          straight into this. */}
      <section id="capabilities" className="px-6 py-16 sm:px-10 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
          <div>
            <div className="lg:sticky lg:top-28">
              <MonoLabel>Capabilities</MonoLabel>
              <h2 className="mt-5 text-3xl sm:text-4xl">How can I help you</h2>
              <p className="text-ink-muted mt-5 max-w-sm leading-relaxed">
                The three kinds of work I take on, and what I use for each.
              </p>
            </div>
          </div>

          <Capabilities capabilities={capabilities} />
        </div>
      </section>

      {/* Selected work. Full width, same list and hover behaviour. */}
      <section
        id="selected-work"
        className="px-6 py-16 sm:px-10 sm:py-20"
      >
        <MonoLabel>Selected work</MonoLabel>

        <div className="mt-8">
          <SelectedWork projects={projects} />
        </div>
      </section>

    {/* Writing */}
      {posts.length > 0 && (
        <section className="px-6 py-16 sm:px-10 sm:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <MonoLabel>Writing</MonoLabel>
            <Link
              href="/blog"
              className="mono-label text-ink-subtle hover:text-ink transition-colors"
            >
              All posts &rarr;
            </Link>
          </div>

          <ul className="border-line mt-8 border-t">
            {posts.map((post) => (
              <li key={post.id} className="border-line border-b">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group hover:bg-surface flex flex-col gap-2 px-2 py-5 transition-colors sm:flex-row sm:gap-6"
                >
                  <span className="mono-label text-ink-subtle w-36 shrink-0 sm:pt-1">
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink block truncate">
                      {post.title}
                    </span>
                    {post.summary && (
                      <span className="text-ink-muted mt-1.5 block text-sm leading-relaxed">
                        {post.summary}
                      </span>
                    )}
                  </span>
                  <span className="mono-label text-ink-subtle shrink-0 sm:pt-1">
                    {post.readingTime} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* LeetCode */}
      <section className="px-6 py-16 sm:px-10 sm:py-20">
        <LeetCodeStats />
      </section>

      {/* Learning */}
      <section className="px-6 py-16 sm:px-10 sm:py-20">
        <MonoLabel>Learning</MonoLabel>
        <h2 className="mt-4 max-w-2xl text-2xl sm:text-3xl">
          Notes I write while working through a subject.
        </h2>
        <p className="text-ink-muted mt-5 max-w-xl leading-relaxed">
          Each problem is stated briefly, answered, and then shown running on
          its own sample rows. The animation below is the real component, from
          the LEFT JOIN problem.
        </p>

        {specimen?.visual && (
          <div className="mt-10">
            <Viz visual={specimen.visual} tables={specimen.tables} />
            <p className="text-ink-subtle mt-4 text-sm">
              From{" "}
              <Link
                href={`/tracks/sql-50/${specimen.slug}`}
                className="text-ink-muted hover:text-ink underline underline-offset-4 transition-colors"
              >
                {specimen.id}. {specimen.title}
              </Link>
            </p>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tracks.map((track) => {
            const active = track.status === "active";
            const body = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg">{track.title}</h3>
                  <Pill tone={active ? "accent" : "neutral"}>
                    {active ? `${sql50.length} / ${track.total}` : "Soon"}
                  </Pill>
                </div>
                <p className="text-ink-muted mt-4 text-sm leading-relaxed">
                  {track.blurb}
                </p>
              </>
            );
            return active ? (
              <Link
                key={track.id}
                href={`/tracks/${track.id}`}
                className="border-line hover:bg-surface min-w-0 rounded-xl border p-6 transition-colors"
              >
                {body}
              </Link>
            ) : (
              <div
                key={track.id}
                className="border-line min-w-0 rounded-xl border p-6 opacity-40"
              >
                {body}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="px-6 py-16 sm:px-10 sm:py-24"
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
          <div>
            <MonoLabel>Contact</MonoLabel>
            <h2 className="mt-5 text-3xl sm:text-4xl">Get in touch</h2>
            <p className="text-ink-muted mt-5 max-w-sm leading-relaxed">
              Email is the surest way to reach me.
            </p>
          </div>

          <dl className="border-line border-t">
            {CONTACT_ROWS.map((row) => (
              <div
                key={row.label}
                className="border-line flex flex-col gap-1 border-b py-5 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <dt className="mono-label text-ink-subtle w-32 shrink-0">
                  {row.label}
                </dt>
                <dd className="min-w-0 text-lg">
                  {row.href ? (
                    <a
                      href={row.href}
                      target={row.external ? "_blank" : undefined}
                      rel={row.external ? "noreferrer noopener" : undefined}
                      className="text-ink hover:text-ink-muted underline underline-offset-4 transition-colors"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <span className="text-ink-muted">{row.value}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
