import { MonoLabel } from "@/components/ui/mono-label";
import type { GalleryImage } from "@/content/project-gallery";

/**
 * The rest of a project's images, under its poster.
 *
 * `object-contain` on a fixed 4:3 tile rather than `object-cover`: these run
 * from a 2000x542 dashboard strip to a portrait photograph, and cropping them
 * to a common shape would cut the reading off a chart or the top off a head.
 * The tile carries the letterboxing on `bg-surface-2`, so the grid stays even
 * while every image stays whole.
 *
 * A server component, and a plain `img` -- these are local assets sized ahead
 * of time, so `next/image` would mean configuration for nothing. Everything
 * below the first row is lazy, since a project page opens on the poster.
 */
export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="border-line mt-16 border-t pt-10">
      <MonoLabel>Gallery</MonoLabel>
      <h2 className="mt-4 max-w-2xl text-2xl sm:text-3xl">Inside the build</h2>
      <p className="text-ink-muted mt-4 max-w-xl leading-relaxed">
        Screens from the running application, the results behind it, and the
        event it was built at.
      </p>

      <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        {images.map((image, i) => (
          <li key={image.src} className="min-w-0">
            <figure>
              <div className="border-line bg-surface-2 aspect-[4/3] overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  loading={i < 2 ? undefined : "lazy"}
                  decoding="async"
                  className="size-full object-contain"
                />
              </div>
              <figcaption className="text-ink-subtle mt-3 text-sm leading-relaxed">
                {image.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
