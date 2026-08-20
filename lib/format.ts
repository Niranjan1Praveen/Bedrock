/**
 * Pure formatting helpers, safe on both sides of the boundary.
 *
 * These live apart from lib/library.ts on purpose. That module imports Prisma,
 * so a client component importing a formatter from it would pull the Postgres
 * driver into the browser bundle -- which is exactly what the build caught.
 */

/** Human-readable byte size, used in listings. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
