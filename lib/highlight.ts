import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/**
 * A single SQL grammar and a single theme, imported explicitly.
 *
 * The full shiki bundle carries hundreds of grammars; importing it would bloat
 * the build for no gain. The JavaScript regex engine is used instead of
 * Oniguruma so no WASM binary is involved at all. Highlighting happens in
 * Server Components at build time, so none of this reaches the browser.
 */
let highlighter: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [import("@shikijs/themes/vesper")],
    langs: [import("@shikijs/langs/sql")],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export async function highlightSql(code: string): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, {
    lang: "sql",
    theme: "vesper",
    colorReplacements: {
      // Let the page's own surface show through instead of the theme's.
      "#101010": "transparent",
    },
  });
}
