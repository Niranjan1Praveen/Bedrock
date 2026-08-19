/**
 * The Bedrock mark: three strata narrowing upward off a solid base layer.
 *
 * Drawn in `currentColor` so it inherits whatever the surrounding text is,
 * and built from three rectangles so it stays legible at favicon size.
 */
export function Logo({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="7" y="3" width="10" height="2.5" rx="1.25" />
      <rect x="4" y="9.25" width="16" height="2.5" rx="1.25" />
      <rect x="1" y="15.5" width="22" height="4" rx="1.75" />
    </svg>
  );
}
