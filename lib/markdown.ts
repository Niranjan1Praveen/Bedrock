import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import {
  getHighlighter,
  SHIKI_COLOR_REPLACEMENTS,
  SHIKI_THEME,
} from "@/lib/highlight";

/**
 * The one markdown renderer.
 *
 * Posts store markdown and nothing else, so this runs on every render of a post
 * page (cached by ISR) and on every editor preview. Having a single pipeline is
 * what guarantees the preview matches what publishes.
 *
 * Raw HTML in the source is not passed through -- remark-rehype drops it unless
 * explicitly allowed -- and rehype-sanitize runs anyway as a second line of
 * defence, since the shiki output has to be allowed through it.
 */

// shiki carries its colours as inline styles on spans, and the default
// sanitize schema strips style outright, which would flatten every code block
// to plain text. Style is therefore permitted on exactly these three elements
// and nowhere else. The sanitizer still drops shiki's `shiki` wrapper class;
// that is left alone because the .prose CSS targets the element, not the class,
// and widening the schema to recover a cosmetic hook is a bad trade.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      "className",
      "style",
      "tabIndex",
    ],
    code: [...(defaultSchema.attributes?.code ?? []), "className", "style"],
    span: [...(defaultSchema.attributes?.span ?? []), "className", "style"],
  },
};

export async function renderMarkdown(markdown: string): Promise<string> {
  const highlighter = await getHighlighter();

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(
      rehypeShikiFromHighlighter,
      // createHighlighterCore returns HighlighterCore, whose lang and theme
      // type parameters are `never` because they are supplied dynamically.
      // The plugin declares HighlighterGeneric<any, any>. Borrowing the
      // plugin's own parameter type keeps `any` out of this file.
      highlighter as unknown as Parameters<
        typeof rehypeShikiFromHighlighter
      >[0],
      {
        theme: SHIKI_THEME,
        colorReplacements: SHIKI_COLOR_REPLACEMENTS,
        // A fence with no language, or one we did not load, renders as plain
        // text instead of throwing.
        fallbackLanguage: "text",
      },
    )
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

/** Average adult reading speed, rounded up, never zero. */
export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** URL-safe slug from a title. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
