import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Copies the runtime assets pdf.js fetches at render time into /public.
 *
 * pdf.js does not bundle these: it requests them over HTTP while rendering.
 * Without the wasm directory it cannot decode JPEG 2000 images, and a page
 * whose only content is such an image renders blank white -- which is exactly
 * what scanned or slide-exported class notes are. cmaps cover CJK text and
 * standard_fonts cover documents that do not embed their fonts.
 *
 * Copied rather than committed so the files can never drift from the installed
 * pdfjs-dist version, which is the usual way this breaks.
 */
const SOURCES = ["wasm", "cmaps", "standard_fonts"];
const from = path.join("node_modules", "pdfjs-dist");
const to = path.join("public", "pdfjs");

if (!existsSync(from)) {
  console.error("pdfjs-dist is not installed; skipping asset copy.");
  process.exit(0);
}

await rm(to, { recursive: true, force: true });
await mkdir(to, { recursive: true });

for (const dir of SOURCES) {
  const src = path.join(from, dir);
  if (!existsSync(src)) {
    console.warn(`  pdfjs-dist/${dir} not found, skipped`);
    continue;
  }
  await cp(src, path.join(to, dir), { recursive: true });
  console.log(`  copied pdfjs-dist/${dir} -> public/pdfjs/${dir}`);
}
