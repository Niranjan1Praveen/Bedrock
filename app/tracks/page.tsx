import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { Pill } from "@/components/ui/pill";
import { getProblems, getTracks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tracks",
  description: "Every subject in Bedrock, built and planned.",
};

export default async function TracksPage() {
  const tracks = await getTracks();
  const written = await Promise.all(
    tracks.map(async (t) => (await getProblems(t.id)).length),
  );

  return (
    <Container className="py-16 sm:py-24">
      <MonoLabel>Tracks</MonoLabel>
      <h1 className="mt-4 max-w-2xl text-3xl sm:text-4xl">
        One subject at a time, built out properly before the next begins.
      </h1>

      <ul className="border-line mt-14 border-t">
        {tracks.map((track, i) => {
          const count = written[i];
          const active = track.status === "active";
          const body = (
            <>
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl">{track.title}</h2>
                <Pill tone={active ? "accent" : "neutral"}>
                  {active ? `${count} of ${track.total}` : "Planned"}
                </Pill>
              </div>
              <p className="text-ink-muted mt-3 max-w-2xl text-sm leading-relaxed">
                {track.blurb}
              </p>
            </>
          );

          return (
            <li key={track.id} className="border-line border-b">
              {active ? (
                <Link
                  href={`/tracks/${track.id}`}
                  className="hover:bg-surface block px-2 py-7 transition-colors"
                >
                  {body}
                </Link>
              ) : (
                <div className="px-2 py-7 opacity-40">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
