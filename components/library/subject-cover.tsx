/**
 * A subject's banner.
 *
 * When no image has been uploaded, one is drawn from the slug rather than
 * stored. Deterministic, so a subject keeps the same cover forever, and every
 * subject has one the moment it is created -- including any added later --
 * without seeding rows or holding files. Nothing is fetched, so it also cannot
 * break or need a licence.
 *
 * Drawn from the site's own tokens, so the library still reads as monochrome.
 */

/** FNV-1a. Small, stable, and good enough to spread slugs across variants. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

type Variant = 0 | 1 | 2 | 3;

function Pattern({ seed, variant }: { seed: number; variant: Variant }) {
  const stroke = "var(--color-line)";
  const accent = "var(--color-ink-subtle)";

  if (variant === 0) {
    // Diagonal rule field.
    return (
      <g stroke={stroke} strokeWidth="1">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 24 - 60} y1={0} x2={i * 24 + 40} y2={120} />
        ))}
        <circle cx={80 + (seed % 60)} cy={60} r="18" stroke={accent} fill="none" />
      </g>
    );
  }

  if (variant === 1) {
    // Concentric arcs, like a signal fanning out.
    return (
      <g stroke={stroke} fill="none" strokeWidth="1">
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx="40" cy="120" r={30 + i * 26} />
        ))}
        <circle cx="40" cy="120" r="5" fill={accent} stroke="none" />
      </g>
    );
  }

  if (variant === 2) {
    // Grid with a few filled cells, like memory.
    const filled = new Set(
      Array.from({ length: 6 }, (_, i) => (seed >> (i * 3)) % 40),
    );
    return (
      <g>
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i % 10) * 34 + 8;
          const y = Math.floor(i / 10) * 28 + 6;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width="26"
              height="20"
              rx="3"
              fill={filled.has(i) ? accent : "none"}
              opacity={filled.has(i) ? 0.35 : 1}
              stroke={stroke}
              strokeWidth="1"
            />
          );
        })}
      </g>
    );
  }

  // Branching tree, like a call graph.
  return (
    <g stroke={stroke} strokeWidth="1" fill="none">
      <path d="M20 60 H90 M90 20 V100 M90 20 H160 M90 100 H160 M160 20 V60 M160 100 V60 M160 60 H240 M240 30 V90 M240 30 H310 M240 90 H310" />
      {[90, 160, 240].map((x) => (
        <circle key={x} cx={x} cy={60} r="4" fill={accent} stroke="none" />
      ))}
    </g>
  );
}

export function SubjectCover({
  slug,
  imageUrl,
  className = "",
}: {
  slug: string;
  imageUrl?: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // Plain img: the URL is a Supabase Storage host that next/image would
      // need configured, and covers are already small.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={`aspect-[12/6] w-full object-cover ${className}`}
      />
    );
  }

  const seed = hash(slug);
  const variant = (seed % 4) as Variant;

  return (
    <svg
      viewBox="0 0 340 128"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`bg-surface-2 aspect-[12/6] w-full ${className}`}
    >
      <Pattern seed={seed} variant={variant} />
    </svg>
  );
}
