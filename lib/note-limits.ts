/**
 * Limits and checks for notes, shared by the browser and the server.
 *
 * Pure and dependency-free so client components can import it without pulling
 * a server module -- the database client, the storage client -- into the
 * bundle. The server repeats every check; the browser only uses them to catch
 * a slip before a round trip.
 */

export const MAX_TITLE = 120;
export const MAX_BODY = 50_000;
export const MAX_LABEL = 120;
export const MAX_URL = 2000;
export const MAX_ATTACHMENTS = 40;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGES_PER_BATCH = 10;

/** The image types the bucket accepts, and the extension each is stored with. */
export const IMAGE_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** For an <input type="file"> accept attribute. */
export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPES).join(",");

/** A trimmed, single-spaced title, or null if it is empty or too long. */
export function cleanTitle(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const title = value.replace(/\s+/g, " ").trim();
  return title && title.length <= MAX_TITLE ? title : null;
}

/**
 * Normalises an address to something safe to put in an href, or null.
 *
 * Only http and https pass. A link saved as `javascript:...` would run when
 * clicked, so the scheme is checked on what the URL parser makes of it rather
 * than by looking at the start of the string. A bare `example.com` is given
 * https, since that is what someone pasting it means.
 */
export function cleanUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw || raw.length > MAX_URL) return null;

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    return url.toString();
  } catch {
    return null;
  }
}
