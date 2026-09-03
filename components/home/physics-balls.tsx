"use client";

import { useEffect, useRef } from "react";

const BALL_COUNT = 8;
/** One size for all of them, big enough to read as objects on the page. */
const BALL_RADIUS = 24;
const SPAWN_STAGGER_MS = 420;
const RESPAWN_DELAY_MS = 800;
/** How far outside the document a ball must get before it counts as lost. */
const ESCAPE_MARGIN = 300;
/** Colliders are only built for what is near the viewport. */
const COLLIDER_BAND = 1.5;
const MAX_COLLIDERS = 140;
/** Rebuild the colliders once the page has scrolled this far since the last. */
const REBUILD_AFTER_PX = 180;

/**
 * Elements solid enough to land on. Deliberately leaf-ish: a `section` would
 * be one enormous slab that nothing could ever fall past.
 */
const CANDIDATES = "h1,h2,h3,p,li,a,button,img,dt,dd";

/**
 * Of those, the ones that read as a whole object rather than a line of text.
 *
 * These stay solid even though they contain other candidates, and swallow
 * whatever is inside them. Without this a project card -- an `a` wrapping the
 * artwork and a caption -- would collapse to just its two caption lines, and
 * a ball would drop straight through the picture above them.
 */
const SOLID = "a,button,img";

type Vec = { x: number; y: number };

/**
 * A handful of white balls loose on the page (see BALL_COUNT).
 *
 * They drop in from random points across the top of the page, deflect off
 * whatever is actually on screen -- the nav, the name, the ribbon, the
 * capability rows -- and keep falling through the gaps between things until
 * they reach the foot of the document. Only a ball flung clear of the page is
 * dropped in again.
 *
 * Two things make this work without marking up more than one element:
 *
 * Colliders are read from the live layout of ordinary elements (see
 * CANDIDATES and SOLID), keeping only the outermost object or innermost line
 * of text at each spot so cards and text act as ledges rather than one
 * section-sized slab. They are rebuilt as the page scrolls, and only for what
 * is near the viewport, so a long document costs no more than a short one.
 * The hero's project ribbon is the one exception, and is handled as its clip
 * box rather than its cards -- see rebuildStatics.
 *
 * The canvas is fixed and viewport-sized while the simulation runs in document
 * coordinates, drawing offset by the scroll position. A canvas actually spanning
 * a 6,000px page would be a ~140MB backing store at 2x; this stays the size of
 * the window however far the page runs.
 *
 * It never intercepts a click: `pointer-events: none`, with a ball grabbed by
 * hit-testing a window-level `pointerdown` in the capture phase, so the press
 * is only taken when it truly lands on one -- which is what stops a ball drag
 * and the ribbon's own drag from both firing.
 */
export function PhysicsBalls() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skipped outright rather than slowed down: this is decoration, and the
    // engine has no business loading for someone who asked for less motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Below md a finger drag belongs to the page's own scrolling. The import
    // sits inside the guard, so matter-js is never fetched on a phone.
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    let disposed = false;
    let teardown = () => {};

    void (async () => {
      const { Bodies, Body, Composite, Engine } = await import("matter-js");
      if (disposed) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const engine = Engine.create();
      engine.gravity.y = 1;

      let viewW = 0;
      let viewH = 0;
      let pageW = 0;
      let pageH = 0;
      let statics: Matter.Body[] = [];

      const measurePage = () => {
        const doc = document.documentElement;
        pageW = doc.scrollWidth;
        pageH = Math.max(doc.scrollHeight, doc.clientHeight);
      };

      const resize = () => {
        viewW = window.innerWidth;
        viewH = window.innerHeight;
        measurePage();

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(viewW * dpr);
        canvas.height = Math.round(viewH * dpr);
        canvas.style.width = `${viewW}px`;
        canvas.style.height = `${viewH}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      /** Document-space position of a viewport point. */
      const toWorld = (clientX: number, clientY: number): Vec => ({
        x: clientX + window.scrollX,
        y: clientY + window.scrollY,
      });

      /**
       * Rebuilds the colliders for the band of page around the viewport.
       *
       * A text container that wraps another match (an `li` around an `a`)
       * yields to the inner one, which is the real surface -- otherwise the
       * two would place overlapping bodies in the same spot. `SOLID` elements
       * are the opposite: they stay solid over whatever they contain, so a
       * card doesn't collapse to just the caption text inside it.
       */
      const rebuildStatics = () => {
        Composite.remove(engine.world, statics);
        statics = [];

        const top = window.scrollY - viewH * COLLIDER_BAND;
        const bottom = window.scrollY + viewH * (1 + COLLIDER_BAND);
        const found: Element[] = [];

        for (const el of document.querySelectorAll(CANDIDATES)) {
          // The ribbon's cards are skipped here and its clip box added below
          // instead -- see the note there.
          if (el.closest("[data-ribbon-track]")) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 24 || r.height < 6) continue;
          const y = r.top + window.scrollY;
          if (y + r.height < top || y > bottom) continue;
          found.push(el);
        }

        const solid = found.filter((el) => el.matches(SOLID));

        for (const el of found) {
          // Anything inside a solid block is already covered by it.
          if (solid.some((s) => s !== el && s.contains(el))) continue;
          // A run of text that wraps another match is a container, not a
          // surface -- the inner one is what a ball actually lands on.
          if (
            !el.matches(SOLID) &&
            found.some((other) => other !== el && el.contains(other))
          ) {
            continue;
          }

          const r = el.getBoundingClientRect();
          statics.push(
            Bodies.rectangle(
              r.left + window.scrollX + r.width / 2,
              r.top + window.scrollY + r.height / 2,
              r.width,
              r.height,
              { isStatic: true, restitution: 0.55, friction: 0.35 },
            ),
          );
          if (statics.length >= MAX_COLLIDERS) break;
        }

        // The ribbon, as its own clip box rather than its cards. The cards
        // run far past that box on both sides -- only a couple are ever
        // within it -- and being clipped makes them invisible, not absent, so
        // colliding with the cards themselves put solid ground under stretches
        // of empty page. The box is also the one part of the ribbon that does
        // not move: the track inside it transforms, the box does not, so this
        // needs no per-frame correction. Nothing is lost by treating the band
        // as solid, since a ball is wider than the gaps between cards.
        const ribbon = document.querySelector("[data-ribbon-track]");
        if (ribbon) {
          const r = ribbon.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            statics.push(
              Bodies.rectangle(
                r.left + window.scrollX + r.width / 2,
                r.top + window.scrollY + r.height / 2,
                r.width,
                r.height,
                { isStatic: true, restitution: 0.55, friction: 0.35 },
              ),
            );
          }
        }

        // The foot of the document, so a ball can come to rest at the very end
        // of the page rather than falling out of the world.
        statics.push(
          Bodies.rectangle(pageW / 2, pageH + 40, pageW + 400, 80, {
            isStatic: true,
            restitution: 0.4,
            friction: 0.6,
          }),
        );

        Composite.add(engine.world, statics);
      };

      const balls: Matter.Body[] = [];

      /**
       * Spread across the full width rather than funnelled from one corner,
       * so some land on the name, some past it, some in the middle. Above the
       * top of the page by a staggered amount so simultaneous balls do not
       * fall in a single flat line.
       */
      const spawnPoint = (): Vec => ({
        x: BALL_RADIUS + Math.random() * (viewW - BALL_RADIUS * 2),
        y: -60 - Math.random() * 240,
      });

      const spawnVelocity = (): Vec => ({
        x: (Math.random() - 0.5) * 3,
        y: 1 + Math.random(),
      });

      const launch = (ball: Matter.Body) => {
        Body.setPosition(ball, spawnPoint());
        Body.setVelocity(ball, spawnVelocity());
        Body.setAngularVelocity(ball, 0);
      };

      const addBall = () => {
        const p = spawnPoint();
        const ball = Bodies.circle(p.x, p.y, BALL_RADIUS, {
          restitution: 0.62,
          friction: 0.03,
          frictionAir: 0.004,
          density: 0.0016,
        });
        Body.setVelocity(ball, spawnVelocity());
        balls.push(ball);
        Composite.add(engine.world, ball);
      };

      resize();
      rebuildStatics();

      const spawnTimers: number[] = [];
      for (let i = 0; i < BALL_COUNT; i++) {
        spawnTimers.push(window.setTimeout(addBall, i * SPAWN_STAGGER_MS));
      }

      // --- dragging -------------------------------------------------------

      let dragged: Matter.Body | null = null;
      let pointer: Vec = { x: 0, y: 0 };
      let previous: Vec = { x: 0, y: 0 };

      const onPointerDown = (e: PointerEvent) => {
        const p = toWorld(e.clientX, e.clientY);
        const hit = balls.find((b) => {
          const dx = b.position.x - p.x;
          const dy = b.position.y - p.y;
          const r = BALL_RADIUS + 8;
          return dx * dx + dy * dy <= r * r;
        });
        if (!hit) return;

        // Only now is the press ours; stopping it here in the capture phase is
        // what keeps the ribbon underneath from starting its own drag.
        e.preventDefault();
        e.stopPropagation();
        dragged = hit;
        pointer = p;
        previous = p;
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!dragged) return;
        pointer = toWorld(e.clientX, e.clientY);
      };

      const onPointerUp = () => {
        dragged = null;
      };

      window.addEventListener("pointerdown", onPointerDown, { capture: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", onPointerUp, { passive: true });
      window.addEventListener("pointercancel", onPointerUp, { passive: true });

      // --- loop -----------------------------------------------------------

      let raf = 0;
      let last = performance.now();
      const pending = new Map<Matter.Body, number>();

      const frame = (now: number) => {
        // Clamped so a backgrounded tab does not resume with one enormous step,
        // which would tunnel every ball straight through the floor.
        const delta = Math.min(now - last, 32);
        last = now;

        if (dragged) {
          // Pinned to the cursor, carrying the velocity it would need to have
          // travelled that far -- which is what it flies off with on release.
          Body.setPosition(dragged, pointer);
          Body.setVelocity(dragged, {
            x: pointer.x - previous.x,
            y: pointer.y - previous.y,
          });
          previous = pointer;
        }

        Engine.update(engine, delta);

        for (const ball of balls) {
          const { x, y } = ball.position;
          const lost =
            x < -ESCAPE_MARGIN ||
            x > pageW + ESCAPE_MARGIN ||
            y > pageH + ESCAPE_MARGIN ||
            y < -pageH;
          if (lost && ball !== dragged && !pending.has(ball)) {
            pending.set(
              ball,
              window.setTimeout(() => {
                launch(ball);
                pending.delete(ball);
              }, RESPAWN_DELAY_MS),
            );
          }
        }

        // Document space to viewport space.
        ctx.clearRect(0, 0, viewW, viewH);
        ctx.save();
        ctx.translate(-window.scrollX, -window.scrollY);
        ctx.fillStyle = "#fafafa";
        for (const ball of balls) {
          ctx.beginPath();
          ctx.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      // --- keeping up with the page ---------------------------------------

      const onResize = () => {
        resize();
        rebuildStatics();
      };

      let builtAt = window.scrollY;
      let scrollTimer = 0;
      const onScroll = () => {
        if (Math.abs(window.scrollY - builtAt) < REBUILD_AFTER_PX) return;
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
          builtAt = window.scrollY;
          measurePage();
          rebuildStatics();
        }, 90);
      };

      window.addEventListener("resize", onResize);
      window.addEventListener("scroll", onScroll, { passive: true });

      // The page grows as sections stream in, which moves the floor.
      const ro = new ResizeObserver(() => {
        measurePage();
        rebuildStatics();
      });
      ro.observe(document.body);

      teardown = () => {
        cancelAnimationFrame(raf);
        spawnTimers.forEach((t) => window.clearTimeout(t));
        pending.forEach((t) => window.clearTimeout(t));
        window.clearTimeout(scrollTimer);
        window.removeEventListener("pointerdown", onPointerDown, {
          capture: true,
        });
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        ro.disconnect();
        Composite.clear(engine.world, false);
        Engine.clear(engine);
      };
    })();

    return () => {
      disposed = true;
      teardown();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] hidden md:block"
    />
  );
}
