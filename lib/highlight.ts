import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/**
 * One shiki instance for the whole site.
 *
 * Grammars and the theme are imported explicitly rather than through shiki's
 * full bundle, which carries hundreds of languages. The JavaScript regex engine
 * avoids pulling in a WASM binary. Everything here runs in Server Components at
 * build or revalidation time, so none of it reaches the browser.
 *
 * The blog and the SQL 50 query blocks share this instance, which is what makes
 * a fenced ```sql block in a post look identical to a solution on a problem page.
 */
let highlighter: Promise<HighlighterCore> | null = null;

export function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [import("@shikijs/themes/vesper")],
    langs: [
      import("@shikijs/langs/sql"),
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/jsx"),
      import("@shikijs/langs/python"),
      import("@shikijs/langs/bash"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/css"),
      import("@shikijs/langs/html"),
      import("@shikijs/langs/markdown"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export const SHIKI_THEME = "vesper";

/** Transparent background so the page's own surface shows through. */
export const SHIKI_COLOR_REPLACEMENTS = { "#101010": "transparent" };

export async function highlightSql(code: string): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, {
    lang: "sql",
    theme: SHIKI_THEME,
    colorReplacements: SHIKI_COLOR_REPLACEMENTS,
  });
}
