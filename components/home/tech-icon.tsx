import {
  siCss,
  siFirebase,
  siFlask,
  siGit,
  siHtml5,
  siJavascript,
  siLanggraph,
  siNextdotjs,
  siPostgresql,
  siPrisma,
  siPython,
  siPytorch,
  siReact,
  siScikitlearn,
  siSupabase,
  siTailwindcss,
  siTensorflow,
  siVercel,
} from "simple-icons";

/**
 * Brand marks for the tools listed in the capabilities section.
 *
 * Drawn with `currentColor` rather than each brand's own colour: a row of
 * twenty brand colours would be the loudest thing on a site that otherwise
 * uses colour only where it carries meaning.
 *
 * These render on the server, so the icon data is inlined into the HTML and
 * none of simple-icons reaches the browser.
 */
const ICONS: Record<string, { path: string }> = {
  "Next.js": siNextdotjs,
  React: siReact,
  "Tailwind CSS": siTailwindcss,
  JavaScript: siJavascript,
  HTML: siHtml5,
  CSS: siCss,
  Python: siPython,
  PyTorch: siPytorch,
  TensorFlow: siTensorflow,
  "scikit-learn": siScikitlearn,
  LangGraph: siLanggraph,
  PostgreSQL: siPostgresql,
  Prisma: siPrisma,
  Supabase: siSupabase,
  Firebase: siFirebase,
  Flask: siFlask,
  Vercel: siVercel,
  Git: siGit,
};

export function TechIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const icon = ICONS[name];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      {icon ? (
        <path d={icon.path} />
      ) : (
        // Matplotlib and SQL have no mark in the set; a neutral glyph keeps
        // the row aligned rather than leaving a hole.
        <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      )}
    </svg>
  );
}
