"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
} from "motion/react";
import type { Project } from "@/content/projects";
import { ProjectArt } from "@/components/home/project-art";

const PREVIEW_W = 340;
const PREVIEW_H = 220;

/**
 * The homepage's only route to project detail pages.
 *
 * A numbered hairline-row list, the same idiom as the SQL 50 index and the
 * homepage's own Writing section. Hovering a row highlights its title and
 * pops an animated preview card over it, which then tracks the cursor as it
 * moves across the row -- the "window" the design is built around. `hovered`
 * lives at the list level rather than per row, so only one preview is ever
 * mounted; the cursor position is shared the same way, since only one card is
 * ever visible at a time. Nothing here depends on hover to function: every
 * row is a plain link, so touch devices (which never fire hover) still work.
 */
export function SelectedWork({ projects }: { projects: Project[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Raw cursor position, relative to whichever row is currently hovered.
  // Springs smooth the follow so the card trails the cursor rather than
  // snapping to it on every pixel of mouse movement.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });

  const track = (e: MouseEvent<HTMLLIElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Centred on the cursor, and clamped horizontally so the card can never
    // push past the row's own width -- rows span the full content width, so
    // an unclamped card could otherwise poke out far enough to introduce a
    // horizontal scrollbar on the page.
    const left = Math.min(
      Math.max(e.clientX - rect.left - PREVIEW_W / 2, 0),
      Math.max(rect.width - PREVIEW_W, 0),
    );
    x.set(left);
    y.set(e.clientY - rect.top - PREVIEW_H / 2);
  };

  return (
    <MotionConfig reducedMotion="user">
      <ul className="border-line border-t">
        {projects.map((p, i) => (
          <li
            key={p.slug}
            className="border-line relative border-b"
            onMouseEnter={(e) => {
              setHovered(p.slug);
              track(e);
            }}
            onMouseMove={track}
            onMouseLeave={() =>
              setHovered((current) => (current === p.slug ? null : current))
            }
          >
            <Link
              href={`/projects/${p.slug}`}
              className="group hover:bg-surface flex items-center gap-4 px-2 py-8 transition-colors sm:gap-8 sm:py-9"
            >
              <span className="mono-label text-ink-subtle w-9 shrink-0 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1">
                <span className="text-ink-subtle group-hover:text-ink block truncate text-2xl transition-colors sm:text-3xl">
                  {p.name}
                </span>
                <span className="mono-label text-ink-subtle mt-2.5 block truncate">
                  {p.subtitle} &middot; {p.stack.join(" · ")}
                </span>
              </span>

              <span className="mono-label text-ink-subtle hidden shrink-0 sm:block">
                {p.year}
              </span>
            </Link>

            <AnimatePresence>
              {hovered === p.slug && (
                <motion.div
                  style={{
                    x: springX,
                    y: springY,
                    width: PREVIEW_W,
                    height: PREVIEW_H,
                  }}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="border-line bg-surface pointer-events-none absolute top-0 left-0 z-10 hidden overflow-hidden rounded-lg border shadow-lg md:block"
                >
                  <ProjectArt project={p} className="absolute inset-0" />
                  <div className="bg-base/85 absolute inset-x-0 bottom-0 px-4 py-3 backdrop-blur-sm">
                    <p className="text-ink truncate text-base">{p.name}</p>
                    <p className="mono-label text-ink-subtle mt-0.5">
                      {p.year}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </MotionConfig>
  );
}
