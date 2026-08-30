import type { Project } from "@/content/projects";

/**
 * Stand-in artwork for a project with no screenshot yet.
 *
 * Deterministic rather than random: the same project always gets the same
 * pattern, tint and rotation, picked by hashing its slug. Kept monochrome and
 * low-opacity to match the site's own restraint -- these are placeholders,
 * not the point. Once `project.image` exists, it renders instead and every
 * place this component is used (the homepage preview, the detail hero)
 * upgrades automatically.
 */

const PATTERNS = ["stripes", "rings", "dots", "crosshatch", "rays"] as const;
type PatternKind = (typeof PATTERNS)[number];

const TINTS = [
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-warn)",
] as const;

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pickFor(slug: string) {
  const h = hash(slug);
  return {
    pattern: PATTERNS[h % PATTERNS.length],
    tint: TINTS[Math.floor(h / PATTERNS.length) % TINTS.length],
    rotate: (h % 4) * 15,
  };
}

function PatternDef({
  kind,
  tint,
  id,
}: {
  kind: PatternKind;
  tint: string;
  id: string;
}) {
  switch (kind) {
    case "stripes":
      return (
        <pattern
          id={id}
          width="18"
          height="18"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="18" stroke={tint} strokeOpacity="0.35" strokeWidth="1.5" />
        </pattern>
      );
    case "rings":
      return (
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="4" fill="none" stroke={tint} strokeOpacity="0.35" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="12" fill="none" stroke={tint} strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="20" fill="none" stroke={tint} strokeOpacity="0.12" strokeWidth="1.5" />
        </pattern>
      );
    case "dots":
      return (
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill={tint} fillOpacity="0.35" />
        </pattern>
      );
    case "crosshatch":
      return (
        <pattern
          id={id}
          width="16"
          height="16"
          patternTransform="rotate(30)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="16" stroke={tint} strokeOpacity="0.28" strokeWidth="1" />
          <line x1="0" y1="0" x2="16" y2="0" stroke={tint} strokeOpacity="0.28" strokeWidth="1" />
        </pattern>
      );
    case "rays":
      return (
        <pattern id={id} width="60" height="60" patternUnits="userSpaceOnUse">
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={i}
              x1="30"
              y1="30"
              x2={30 + 30 * Math.cos((i * Math.PI) / 4)}
              y2={30 + 30 * Math.sin((i * Math.PI) / 4)}
              stroke={tint}
              strokeOpacity="0.25"
              strokeWidth="1.5"
            />
          ))}
        </pattern>
      );
  }
}

export function ProjectArt({
  project,
  className = "",
}: {
  project: Project;
  className?: string;
}) {
  if (project.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.image}
        alt=""
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const { pattern, tint, rotate } = pickFor(project.slug);
  const id = `project-art-${project.slug}`;

  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      aria-hidden
    >
      <defs>
        <PatternDef kind={pattern} tint={tint} id={id} />
      </defs>
      <rect width="400" height="240" fill="var(--color-surface-2)" />
      <rect
        width="400"
        height="240"
        fill={`url(#${id})`}
        transform={`rotate(${rotate} 200 120)`}
      />
    </svg>
  );
}
