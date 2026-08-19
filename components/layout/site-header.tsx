import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="border-line bg-base/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between">
        <Link
          href="/"
          className="text-ink hover:text-ink-muted flex items-center gap-2.5 transition-colors"
        >
          <Logo className="size-4" />
          <span className="mono-label">Bedrock</span>
        </Link>
        <SiteNav />
      </Container>
    </header>
  );
}
