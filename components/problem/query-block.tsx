import { highlightSql } from "@/lib/highlight";

/** Highlights SQL at build time -- no highlighter ships to the browser. */
export async function QueryBlock({ query }: { query: string }) {
  const html = await highlightSql(query);
  return (
    <div className="scroll-x border-line bg-surface rounded-lg border p-4 text-[13px] leading-relaxed sm:p-5 [&_pre]:bg-transparent! [&_pre]:font-mono">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
