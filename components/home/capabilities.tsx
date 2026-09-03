import type { Capability } from "@/content/profile";
import { TechIcon } from "@/components/home/tech-icon";

/**
 * The capability cards, as a stack.
 *
 * Every card is `sticky` at the same band near the top of the viewport, so
 * scrolling slides each one up over the last rather than past it, leaving the
 * earlier cards' rules visible underneath. That needs three things to hold:
 * each card is opaque (or the one beneath shows through), each `top` is
 * stepped by index (or they would land exactly on top of each other and the
 * stack would read as one card), and no ancestor may set `overflow`, which
 * would cancel the stickiness outright.
 *
 * The cards carry the page's own background rather than a raised surface, so
 * they read as flat rules on the page -- opaque is a requirement of the stack,
 * not a visual choice.
 *
 * A server component: the effect is entirely CSS, so none of this needs to
 * reach the browser as JavaScript.
 */
export function Capabilities({ capabilities }: { capabilities: Capability[] }) {
  return (
    <div>
      {capabilities.map((c, i) => (
        <div
          key={c.title}
          className="sticky pb-5"
          // 6rem clears the sticky header; the per-card step is what leaves
          // the previous card's edge peeking out above this one.
          style={{ top: `calc(6rem + ${i * 3.5}rem)` }}
        >
          <article className="bg-base border-line grid grid-cols-1 gap-6 border-t pt-8 pb-10 lg:grid-cols-[3rem_minmax(0,1fr)_minmax(0,20rem)] lg:gap-12">
            <span className="text-ink-subtle font-mono text-sm tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <h3 className="text-2xl sm:text-3xl">{c.title}</h3>
              <p className="text-ink-muted mt-4 max-w-md leading-relaxed">
                {c.summary}
              </p>
            </div>

            <ul className="min-w-0">
              {c.items.map((item, n) => (
                <li
                  key={item}
                  className="border-line flex items-center gap-4 border-b py-3 last:border-b-0"
                >
                  <span className="mono-label text-ink-subtle w-6 shrink-0 tabular-nums">
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <TechIcon
                    name={item}
                    className="text-ink-subtle size-4 shrink-0"
                  />
                  <span className="text-ink-muted min-w-0 truncate text-[15px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      ))}
    </div>
  );
}
