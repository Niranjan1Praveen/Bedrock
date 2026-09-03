"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import type { Project } from "@/content/projects";
import { ProjectArt } from "@/components/home/project-art";

/** Pixels per second the ribbon drifts on its own. */
const SPEED = 34;
/** Past this much pointer travel, a drag is a drag and not a click. */
const DRAG_SLOP = 6;

/**
 * The projects, as a continuously moving ribbon.
 *
 * The list is rendered twice and the track is wrapped back by exactly one
 * copy's width whenever it passes it, so the motion never reaches an end to
 * stop at -- what leaves on the left is the same window arriving on the right.
 *
 * Dragging scrubs the ribbon directly and the drift resumes on release. The
 * offset lives in a ref and is written straight to `transform` inside the
 * animation frame: putting it in state would re-render the whole ribbon sixty
 * times a second for a value React has no other use for.
 *
 * The art on each card is generated per project (see ProjectArt) and is
 * replaced automatically by a real screenshot once one is set on the project.
 */
export function HeroSlider({ projects }: { projects: Project[] }) {
  const track = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const copyWidth = useRef(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const travelled = useRef(0);

  /** Keeps the offset inside (-copyWidth, 0], where the two copies align. */
  const wrap = useCallback((value: number) => {
    const w = copyWidth.current;
    if (!w) return value;
    return ((value % w) - w) % w;
  }, []);

  // The wrap distance is the gap-inclusive stride of one whole copy, taken as
  // the offset of the second copy's first window. Halving scrollWidth would be
  // out by half a gap -- enough for the ribbon to visibly jump every loop.
  useEffect(() => {
    const el = track.current;
    if (!el) return;

    const measure = () => {
      const first = el.children[0] as HTMLElement | undefined;
      const secondCopy = el.children[projects.length] as HTMLElement | undefined;
      if (first && secondCopy) {
        copyWidth.current = secondCopy.offsetLeft - first.offsetLeft;
      }
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [projects.length]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      // Clamped so returning to a backgrounded tab does not jump the ribbon
      // forward by however long it was away.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!dragging.current && !reduced.matches) {
        offset.current = wrap(offset.current - SPEED * dt);
      }
      el.style.transform = `translate3d(${offset.current}px, 0, 0)`;
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [wrap]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    travelled.current = 0;
    startX.current = e.clientX;
    startOffset.current = offset.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    travelled.current = Math.max(travelled.current, Math.abs(dx));
    offset.current = wrap(startOffset.current + dx);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // A drag that ends on top of a window must not also open it.
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (travelled.current > DRAG_SLOP) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (projects.length === 0) return null;

  // Rendered twice: the second copy is what the first wraps around onto.
  const ribbon = [...projects, ...projects];

  return (
    <div className="min-w-0">
      <div
        // Marks this out for components/home/physics-balls.tsx: everything
        // inside moves under its own transform every frame, which the
        // physics layer's periodic collider rebuild cannot track, so it
        // syncs these continuously instead of scanning for them generically.
        data-ribbon-track
        // touch-pan-y so a vertical swipe still scrolls the page on a phone
        // while a horizontal one scrubs the ribbon.
        className="cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        <div ref={track} className="flex w-max gap-4 will-change-transform">
          {ribbon.map((p, i) => (
            <div
              key={`${p.slug}-${i}`}
              className="w-[80vw] shrink-0 sm:w-[24rem] lg:w-[27rem]"
              // The second copy is a visual duplicate of the first.
              aria-hidden={i >= projects.length}
            >
              <Link
                href={`/projects/${p.slug}`}
                draggable={false}
                tabIndex={i >= projects.length ? -1 : undefined}
                className="group border-line bg-surface hover:border-ink-subtle block overflow-hidden rounded-xl border transition-colors"
              >
                <div className="relative aspect-video">
                  <ProjectArt project={p} className="absolute inset-0" />
                  <div className="bg-base/85 absolute inset-x-0 bottom-0 px-4 py-3.5 backdrop-blur-sm">
                    <p className="text-ink truncate text-[1rem]">{p.name}</p>
                    <p className="text-ink-subtle mt-1.5 truncate font-mono text-xs tracking-[0.1em] uppercase">
                      {p.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <p className="text-ink-subtle mt-5 px-6 font-mono text-xs tracking-[0.14em] uppercase sm:px-10 lg:px-0">
        Built by Code4Change
      </p>
    </div>
  );
}
