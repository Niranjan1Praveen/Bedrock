import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { profile } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer className="border-line mt-24 border-t py-10">
      <Container className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-ink flex items-center gap-2.5">
            <Logo className="size-4" />
            <span className="mono-label">Bedrock</span>
          </p>
          <p className="text-ink-subtle mt-3 text-sm">
            {profile.name} &middot; {profile.location}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3">
          <Link
            href="/projects"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/tracks/sql-50"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            SQL 50
          </Link>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            GitHub
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${profile.links.email}`}
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            Email
          </a>
        </nav>
      </Container>
    </footer>
  );
}
