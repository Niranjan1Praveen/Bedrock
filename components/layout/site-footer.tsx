import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="border-line mt-24 border-t py-10">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-ink flex items-center gap-2.5">
            <Logo className="size-4" />
            <span className="mono-label">Bedrock</span>
          </p>
          <p className="text-ink-subtle mt-3 text-sm">
            A personal reference for the patterns worth remembering.
          </p>
        </div>
        <nav className="flex gap-6">
          <Link
            href="/tracks"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            Tracks
          </Link>
          <Link
            href="/tracks/sql-50"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            SQL 50
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
