"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { coverOn, createFrameSequence, featherEdges, type Focus } from "@/lib/frameSequence";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  /** folder under /public, e.g. "/frames/bacon" */
  base: string;
  count: number;
  bg: string;
  /**
   * play     – plays once when it scrolls into view, then holds the last frame
   * scrub    – follows the scroll position while the element crosses the viewport
   * progress – shows the point given by `progress` (0..1), easing between values
   */
  mode: "play" | "scrub" | "progress";
  progress?: number;
  focus?: Focus;
  /** focus used below 768px wide, when it should differ */
  focusMobile?: Focus;
  fps?: number;
  /** accessible description; omit for purely decorative clips */
  label?: string;
  className?: string;
};

/** Draws a Flow clip's frame sequence into a canvas that fills its parent. */
export function FramePlayer({
  base,
  count,
  bg,
  mode,
  progress = 0,
  focus = { x: 0.5, y: 0.5 },
  focusMobile,
  fps = 20,
  label,
  className = "",
}: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ goTo: (p: number) => void } | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useGSAP(
    () => {
      const el = root.current;
      const canvas = canvasRef.current;
      if (!el || !canvas) return;

      const wide = coverOn(focus);
      const narrow = focusMobile ? coverOn(focusMobile) : wide;
      const seq = createFrameSequence(canvas, {
        base,
        count,
        bg,
        place: (cw, ch, iw, ih) => (cw < 768 ? narrow : wide)(cw, ch, iw, ih),
        after: focus.free || focusMobile?.free ? featherEdges(bg) : undefined,
      });
      const last = count - 1;
      const state = { frame: 0 };
      const render = () => seq.set(state.frame);

      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
        (c) => {
          const still = Boolean(c.conditions?.still);

          if (mode === "progress") {
            const ready = seq.preload();
            api.current = {
              goTo: (p) => {
                const target = Math.round(Math.max(0, Math.min(1, p)) * last);
                if (still) {
                  state.frame = target;
                  seq.load(target).then(render);
                  return;
                }
                ready.then(() => gsap.to(state, { frame: target, duration: 2.2, ease: "power2.inOut", onUpdate: render }));
              },
            };
            seq.load(0).then(render);
            api.current.goTo(progressRef.current);
            return () => {
              api.current = null;
            };
          }

          if (still) {
            state.frame = last;
            seq.load(last).then(render);
            return;
          }
          seq.load(0).then(render);
          const ready = seq.preload();

          if (mode === "scrub") {
            gsap.to(state, {
              frame: last,
              ease: "none",
              onUpdate: render,
              scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 35%", scrub: 0.6 },
            });
            return;
          }

          // play: once in view, when every frame is in (or after 2.5s at most)
          let started = false;
          const io = new IntersectionObserver(
            ([entry]) => {
              if (!entry.isIntersecting || started) return;
              started = true;
              io.disconnect();
              Promise.race([ready, new Promise((r) => setTimeout(r, 2500))]).then(() =>
                gsap.to(state, { frame: last, duration: count / fps, ease: "none", onUpdate: render }),
              );
            },
            { threshold: 0.35 },
          );
          io.observe(el);
          return () => io.disconnect();
        },
      );

      return () => {
        mm.revert();
        seq.destroy();
      };
    },
    { scope: root, dependencies: [base, count, bg, mode] },
  );

  useEffect(() => {
    api.current?.goTo(progress);
  }, [progress]);

  return (
    // a span so it can sit inside buttons (menu tiles)
    <span ref={root} className={`absolute inset-0 block ${className}`} style={{ background: bg }}>
      <canvas
        ref={canvasRef}
        className="block size-full"
        {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      />
    </span>
  );
}
