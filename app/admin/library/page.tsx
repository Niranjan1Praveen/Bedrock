import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { Skeleton, SkeletonCards } from "@/components/ui/skeleton";
import { SubjectSearch } from "@/components/library/subject-search";
import { getUser } from "@/lib/auth";
import { getSubjectsWithProgress } from "@/lib/library";

export const metadata: Metadata = {
  title: "Library",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Streams in; the header and Upload button are usable before it lands. */
async function Subjects() {
  const user = await getUser();
  const userId = typeof user?.sub === "string" ? user.sub : "";
  const subjects = await getSubjectsWithProgress(userId);

  if (subjects.length === 0) {
    return (
      <p className="border-line text-ink-subtle mt-12 rounded-lg border border-dashed px-6 py-16 text-center text-sm">
        Nothing uploaded yet.
      </p>
    );
  }

  return <SubjectSearch subjects={subjects} />;
}

export default function LibraryPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <MonoLabel>Library</MonoLabel>
          <h1 className="mt-4 text-3xl">Subjects</h1>
          <p className="text-ink-subtle mt-3 max-w-xl text-sm leading-relaxed">
            Reference PDFs, Word documents and slides, read in the browser.
            Progress is yours alone and is not shared with the other accounts.
          </p>
        </div>
        <Link
          href="/admin/library/upload"
          className="mono-label bg-ink text-base hover:bg-ink-muted rounded px-4 py-2.5 transition-colors"
        >
          Upload
        </Link>
      </div>

      <Suspense
        fallback={
          <div>
            <Skeleton className="mt-10 h-10 w-full max-w-sm" />
            <div className="mt-8">
              <SkeletonCards />
            </div>
          </div>
        }
      >
        <Subjects />
      </Suspense>
    </Container>
  );
}
