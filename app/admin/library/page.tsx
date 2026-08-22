import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { SubjectSearch } from "@/components/library/subject-search";
import { getUser } from "@/lib/auth";
import { getSubjectsWithProgress } from "@/lib/library";

export const metadata: Metadata = {
  title: "Library",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await getUser();
  const userId = typeof user?.sub === "string" ? user.sub : "";
  const subjects = await getSubjectsWithProgress(userId);

  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <MonoLabel>Library</MonoLabel>
          <h1 className="mt-4 text-3xl">Subjects</h1>
          <p className="text-ink-subtle mt-3 max-w-xl text-sm leading-relaxed">
            Reference PDFs, read in the browser. Progress is yours alone and is
            not shared with the other accounts.
          </p>
        </div>
        <Link
          href="/admin/library/upload"
          className="mono-label bg-ink text-base hover:bg-ink-muted rounded px-4 py-2.5 transition-colors"
        >
          Upload
        </Link>
      </div>

      {subjects.length === 0 ? (
        <p className="border-line text-ink-subtle mt-12 rounded-lg border border-dashed px-6 py-16 text-center text-sm">
          Nothing uploaded yet.
        </p>
      ) : (
        <SubjectSearch subjects={subjects} />
      )}
    </Container>
  );
}
