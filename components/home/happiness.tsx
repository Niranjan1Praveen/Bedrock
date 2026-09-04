"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { HappinessSite } from "@/content/happiness";
import { MonoLabel } from "@/components/ui/mono-label";

/**
 * The Ellipsis of Happiness work, as a constellation around the foundation.
 *
 * The three sites belong to one organisation, so they are drawn orbiting its
 * mark rather than listed: a bubble in the middle, a card at each point, and a
 * line tethering each card back to the centre. Cards can be dragged anywhere
 * on the page and spring back to where they belong, their tether stretching to
 * follow.
 *
 * Below md this is dropped entirely for a plain stack. A hub and its spokes
 * needs width to read as one thing, dragging fights the page's own scrolling
 * on touch, and the cards say the same stacked.
 *
 * The tethers follow the cards without re-rendering anything: the parent owns
 * one pair of motion values per card, the card's transform reads them, and so
 * does its line's far endpoint. A drag writes the SVG attribute directly
 * rather than passing through React sixty times a second.
 */

/**
 * Where each card sits on the stage.
 *
 * The two upper seats clear the hub horizontally, so their height is free.
 * The lower one sits directly beneath it and is the only one that can collide,
 * so it is measured down from the centre rather than given a percentage that
 * stops clearing the hub the moment the stage changes height.
 *
 * 11rem is the hub's own radius (5rem at its largest) plus a 6rem gap. The gap
 * is what the arrow is drawn in: at 1.5rem it had barely a dozen pixels left
 * after both end trims and rendered as a stub arrowhead.
 */
const SEATS = [
  { left: "2%", top: "0%" },
  { left: "72%", top: "0%" },
  { left: "37%", top: "calc(50% + 11rem)" },
] as const;

/** Card width, as a share of the stage. */
const CARD_WIDTH = "26%";

/** Past this much travel a press was a drag, and must not open the link. */
const DRAG_SLOP = 6;

type Point = { x: number; y: number };

const cardChrome =
  "group border-line bg-surface hover:border-ink-subtle flex min-w-0 flex-col rounded-xl border p-6 transition-colors";

/** The contents of a card, shared by the stacked and orbiting versions. */
function CardBody({ site, grow = false }: { site: HappinessSite; grow?: boolean }) {
  return (
    <>
      <MonoLabel>{site.kind}</MonoLabel>
      <h3 className="text-ink mt-4 text-xl">{site.name}</h3>
      <p
        className={`text-ink-muted mt-3 text-sm leading-relaxed ${grow ? "flex-1" : ""}`}
      >
        {site.summary}
      </p>
      <span className="border-line text-ink-subtle group-hover:text-ink mt-6 flex items-baseline justify-between gap-4 border-t pt-4 font-mono text-[0.8125rem] tracking-[0.1em] transition-colors">
        <span className="truncate">{site.host}</span>
        <span aria-hidden>&rarr;</span>
      </span>
    </>
  );
}

/** How far the arc bows away from the straight line, as a share of its length. */
const BOW = 0.16;
/** Clearance left at each end, so the curve starts and lands in open space. */
const HUB_GAP = 10;
const CARD_GAP = 14;

/**
 * One tether: a curved arrow from the hub to a card, following it as it drags.
 *
 * The path is trimmed at both ends rather than drawn centre to centre -- it
 * leaves the bubble's edge and stops short of the card's, so the arrowhead
 * points at the card instead of being buried under it. Where it stops is the
 * intersection of the line with the card's own box, recomputed as the card
 * moves, which is what keeps the arrow on the edge whichever way it is pulled.
 */
function Tether({
  from,
  to,
  half,
  hubRadius,
  x,
  y,
}: {
  from: Point;
  to: Point;
  /** Half the card's width and height, for finding its edge. */
  half: Point;
  hubRadius: number;
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const d = useTransform([x, y], ([dx, dy]: number[]) => {
    const tx = to.x + dx;
    const ty = to.y + dy;

    const vx = tx - from.x;
    const vy = ty - from.y;
    const len = Math.hypot(vx, vy) || 1;
    const ux = vx / len;
    const uy = vy / len;

    // Where the straight line would cross the card's box.
    const edge = Math.min(
      Math.abs(ux) > 1e-3 ? half.x / Math.abs(ux) : Infinity,
      Math.abs(uy) > 1e-3 ? half.y / Math.abs(uy) : Infinity,
    );

    const sx = from.x + ux * (hubRadius + HUB_GAP);
    const sy = from.y + uy * (hubRadius + HUB_GAP);
    const ex = tx - ux * (edge + CARD_GAP);
    const ey = ty - uy * (edge + CARD_GAP);

    // Bow the arc out perpendicular to its own direction.
    const span = Math.hypot(ex - sx, ey - sy);
    const cx = (sx + ex) / 2 + -uy * span * BOW;
    const cy = (sy + ey) / 2 + ux * span * BOW;

    return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
  });

  return (
    <motion.path
      d={d}
      fill="none"
      stroke="var(--color-line)"
      strokeWidth={1}
      markerEnd="url(#tether-arrow)"
    />
  );
}

export function Happiness({ sites }: { sites: HappinessSite[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const dragged = useRef(0);

  // One pair per seat. Three of them, declared flat, so the hook order is
  // fixed however many sites arrive.
  const x0 = useMotionValue(0);
  const y0 = useMotionValue(0);
  const x1 = useMotionValue(0);
  const y1 = useMotionValue(0);
  const x2 = useMotionValue(0);
  const y2 = useMotionValue(0);
  const drags = [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ];

  const [hub, setHub] = useState<Point | null>(null);
  const [hubRadius, setHubRadius] = useState(0);
  const [anchors, setAnchors] = useState<
    ({ centre: Point; half: Point } | null)[]
  >([]);

  /**
   * Measures where everything rests, in stage coordinates, so the tethers know
   * what to join. Re-run on resize, since every seat is a percentage.
   */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const box = stage.getBoundingClientRect();
      if (!box.width) return; // hidden below md

      const centre = (el: Element | null): Point | null => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left - box.left + r.width / 2,
          y: r.top - box.top + r.height / 2,
        };
      };

      setHub(centre(hubRef.current));
      const h = hubRef.current?.getBoundingClientRect();
      setHubRadius(h ? h.width / 2 : 0);

      setAnchors(
        cardRefs.current.map((el) => {
          const c = centre(el);
          if (!el || !c) return null;
          const r = el.getBoundingClientRect();
          return { centre: c, half: { x: r.width / 2, y: r.height / 2 } };
        }),
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [sites.length]);

  const orbiting = sites.slice(0, SEATS.length);

  return (
    <MotionConfig reducedMotion="user">
      {/* Below md: the plain stack. No hub, no tethers, no dragging. */}
      <div className="grid grid-cols-1 gap-5 md:hidden">
        {sites.map((site) => (
          <a
            key={site.host}
            href={site.live}
            target="_blank"
            rel="noreferrer noopener"
            className={cardChrome}
          >
            <CardBody site={site} grow />
          </a>
        ))}
      </div>

      {/* md and up: the constellation. */}
      <div
        ref={stageRef}
        className="relative hidden h-[54rem] md:block"
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <marker
              id="tether-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--color-line)" />
            </marker>
          </defs>

          {hub &&
            orbiting.map((site, i) => {
              const anchor = anchors[i];
              if (!anchor) return null;
              return (
                <Tether
                  key={site.host}
                  from={hub}
                  to={anchor.centre}
                  half={anchor.half}
                  hubRadius={hubRadius}
                  x={drags[i].x}
                  y={drags[i].y}
                />
              );
            })}
        </svg>

        {/* The foundation, at the centre. */}
        <div
          ref={hubRef}
          className="border-line bg-surface absolute top-1/2 left-1/2 size-36 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border lg:size-40"
        >
          {/* Plain img: a local asset already sized for this, so next/image
              would mean configuration for nothing. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/happiness/ehf.webp"
            alt="Ellipsis of Happiness Foundation"
            className="size-full object-cover select-none"
          />
        </div>

        {orbiting.map((site, i) => (
          <motion.a
            key={site.host}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            href={site.live}
            target="_blank"
            rel="noreferrer noopener"
            draggable={false}
            drag
            dragSnapToOrigin
            dragElastic={1}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 240, bounceDamping: 24 }}
            whileDrag={{ scale: 1.02, zIndex: 30 }}
            onDragStart={() => {
              dragged.current = 0;
            }}
            onDrag={(_, info) => {
              dragged.current = Math.max(
                dragged.current,
                Math.abs(info.offset.x) + Math.abs(info.offset.y),
              );
            }}
            // A card let go over itself must not also open the site.
            onClickCapture={(e) => {
              if (dragged.current > DRAG_SLOP) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            style={{
              x: drags[i].x,
              y: drags[i].y,
              left: SEATS[i].left,
              top: SEATS[i].top,
              width: CARD_WIDTH,
            }}
            className={`${cardChrome} absolute cursor-grab active:cursor-grabbing`}
          >
            <CardBody site={site} />
          </motion.a>
        ))}
      </div>
    </MotionConfig>
  );
}
