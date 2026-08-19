import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { Pill } from "@/components/ui/pill";
import { Viz } from "@/components/viz";
import { ProjectCard } from "@/components/home/project-card";
import { ProgressStrip } from "@/components/home/progress-strip";
import { LeetCodeStats } from "@/components/home/leetcode-stats";
import { featuredProjects } from "@/content/projects";
import { hackathons, profile, skills } from "@/content/profile";
import { getProblem, getProblems, getTracks } from "@/lib/content";

export default async function HomePage() {
  const [tracks, sql50, specimen] = await Promise.all([
    getTracks(),
    getProblems("sql-50"),
    getProblem("sql-50", "replace-employee-id-with-the-unique-identifier"),
  ]);

  return (
    <>
      {/* Hero */}
      <Container className="pt-20 pb-16 sm:pt-28 sm:pb-20">
        <MonoLabel>{profile.role}</MonoLabel>
        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
          {profile.name}
        </h1>
        <p className="text-ink-muted mt-7 max-w-xl leading-relaxed">
          I build web applications and the machine learning services behind
          them. Computer science undergraduate at Amity University, Noida. Four
          of the projects below placed at national hackathons this year.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={`mailto:${profile.links.email}`}
            className="mono-label text-ink hover:text-ink-muted transition-colors"
          >
            {profile.links.email}
          </a>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            GitHub &rarr;
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            LinkedIn &rarr;
          </a>
          <a
            href={profile.links.resume}
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            Résumé (PDF) &rarr;
          </a>
        </div>
      </Container>

      <Container>
        {/* Projects */}
        <section className="border-line border-t py-16 sm:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <MonoLabel>Selected projects</MonoLabel>
            <Link
              href="/projects"
              className="mono-label text-ink-subtle hover:text-ink transition-colors"
            >
              All projects &rarr;
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {featuredProjects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>

        {/* LeetCode */}
        <section className="border-line border-t py-16 sm:py-20">
          <LeetCodeStats />
        </section>

        {/* Learning */}
        <section className="border-line border-t py-16 sm:py-20">
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

          <div className="mt-12 grid grid-cols-1 gap-px sm:grid-cols-3">
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

          <div className="mt-12 max-w-md">
            <ProgressStrip track="sql-50" total={sql50.length} />
          </div>
        </section>

        {/* About */}
        <section className="border-line border-t py-16 sm:py-20">
          <MonoLabel>About</MonoLabel>

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0">
              <h3 className="text-lg">Tools</h3>
              <dl className="mt-6 space-y-5">
                {skills.map((group) => (
                  <div key={group.group}>
                    <dt className="mono-label text-ink-subtle">
                      {group.group}
                    </dt>
                    <dd className="mt-2.5 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="mono-label border-line text-ink-muted rounded border px-2 py-1"
                        >
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="min-w-0">
              <h3 className="text-lg">Hackathons</h3>
              <ul className="border-line mt-6 border-t">
                {hackathons.map((h) => (
                  <li
                    key={`${h.event}-${h.project}`}
                    className="border-line flex gap-4 border-b py-4"
                  >
                    <span className="mono-label text-accent w-24 shrink-0 pt-0.5">
                      {h.result}
                    </span>
                    <span className="min-w-0">
                      <span className="text-ink-muted block text-sm leading-relaxed">
                        {h.event}
                      </span>
                      <span className="text-ink-subtle mt-1 block text-sm">
                        {h.project}, {h.year}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-12 text-lg">Education</h3>
              <div className="mt-6">
                <p className="text-ink">{profile.education.degree}</p>
                <p className="text-ink-muted mt-1.5 text-sm">
                  {profile.education.school}
                </p>
                <p className="text-ink-subtle mt-1.5 text-sm">
                  {profile.education.period} &middot;{" "}
                  {profile.education.result}
                </p>
                <p className="text-ink-subtle mt-4 text-sm leading-relaxed">
                  Coursework: {profile.education.coursework.join(", ")}.
                </p>
              </div>

              <h3 className="mt-12 text-lg">Contact</h3>
              <p className="text-ink-subtle mt-5 text-sm">
                {profile.location}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                <a
                  href={`mailto:${profile.links.email}`}
                  className="mono-label text-ink hover:text-ink-muted transition-colors"
                >
                  Email
                </a>
                <a
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mono-label text-ink-subtle hover:text-ink transition-colors"
                >
                  LinkedIn &rarr;
                </a>
                <a
                  href={profile.links.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mono-label text-ink-subtle hover:text-ink transition-colors"
                >
                  GitHub &rarr;
                </a>
                <a
                  href={profile.links.resume}
                  className="mono-label text-ink-subtle hover:text-ink transition-colors"
                >
                  Résumé &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
