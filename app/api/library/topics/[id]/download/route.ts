import archiver from "archiver";
import { Readable } from "node:stream";
import { unauthorized } from "@/lib/auth";
import { getTopicForDownload } from "@/lib/library";
import { createAdminClient, LIBRARY_BUCKET } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
// The default function budget is 10s on most plans, which is tight once this
// is fetching and zipping several files in sequence. Raised rather than
// parallelised: the admin client has no documented concurrent-request limit,
// but there is no reason to find out on a personal library's traffic.
export const maxDuration = 60;

/**
 * Every document in one topic, as a single zip.
 *
 * Fetched from storage and assembled here rather than redirecting to a set of
 * signed URLs, because there is no way to hand a browser more than one URL for
 * "download" to act on at once -- opening several in a loop either triggers a
 * multiple-downloads permission prompt or is popup-blocked outright. A zip is
 * one response the browser already knows how to save.
 *
 * The whole file is read into memory per document rather than piped through:
 * Supabase's storage client returns a Blob, not a stream, so there is no
 * lower-memory option without dropping to a raw fetch against the signed URL.
 * Fine at this library's scale -- a topic's notes, not a media archive.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { id } = await params;
  const topic = await getTopicForDownload(id);
  if (!topic) return Response.json({ error: "Not found" }, { status: 404 });
  if (topic.documents.length === 0) {
    return Response.json({ error: "Nothing to download" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const archive = archiver("zip", { zlib: { level: 6 } });
  // Missing entries should not take down the whole zip -- see the loop below,
  // which already logs and skips. This only catches archiver's own internal
  // stream errors.
  archive.on("error", (e) => console.error("zip stream error", e));

  // Builds the archive on its own schedule while the Response starts
  // streaming immediately below. Not awaited: awaiting here would buffer the
  // entire zip before the browser saw a single byte.
  (async () => {
    const seen = new Map<string, number>();
    for (const doc of topic.documents) {
      const { data, error } = await supabase.storage
        .from(LIBRARY_BUCKET)
        .download(doc.storagePath);
      if (error || !data) {
        console.error(`could not fetch ${doc.storagePath} for zip`, error);
        continue;
      }
      archive.append(Buffer.from(await data.arrayBuffer()), {
        name: uniqueZipEntryName(doc.title, doc.storagePath, seen),
      });
    }
    archive.finalize();
  })().catch((e) => archive.destroy(e instanceof Error ? e : new Error(String(e))));

  const zipName = `${topic.subject.slug}-${topic.slug}.zip`;

  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      // ASCII-safe: subject and topic slugs are already slugified, so this
      // never needs the filename*= fallback other Content-Dispositions here
      // would need for a user-typed title.
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * A safe, deduplicated name for one file inside the zip.
 *
 * Titles are free text -- unlike storage paths, nothing has ever required
 * them to be filesystem-safe or unique within a topic -- so both have to be
 * handled here rather than assumed away.
 */
function uniqueZipEntryName(
  title: string,
  storagePath: string,
  seen: Map<string, number>,
): string {
  const ext = storagePath.slice(storagePath.lastIndexOf("."));
  const base = title.replace(/[\\/:*?"<>|]+/g, "-").trim() || "document";

  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? `${base}${ext}` : `${base} (${count + 1})${ext}`;
}
