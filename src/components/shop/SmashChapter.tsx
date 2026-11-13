"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLang } from "@/components/LangProvider";
import { coverOn, createFrameSequence } from "@/lib/frameSequence";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BASE = "/frames/smash-melt";
const COUNT = 199;
/** The first ~2s of the clip are the raw beef sitting still; scrub from just before the press. */
const FIRST = 40;
const BG = "#0b1110";

/**
 * Pinned chapter: scrolling presses the patties and melts the cheddar while the
 * paragraph lights up word by word.
 */
export function SmashChapter() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLang();

  useGSAP(
    () => {
      const section = root.current;
      const canvas = canvasRef.current;
      if (!section || !canvas) return;

      const wide = coverOn({ x: 0.5, y: 0.66, zoom: 1.05, ty: 0.68 });
      const narrow = coverOn({ x: 0.5, y: 0.66, zoom: 1, ty: 0.7 });
      const seq = createFrameSequence(canvas, {
        base: BASE,
        count: COUNT,
        bg: BG,
        place: (cw, ch, iw, ih) => (cw < 768 ? narrow : wide)(cw, ch, iw, ih),
      });
      const state = { frame: FIRST };
      const render = () => seq.set(state.frame);
      const words = gsap.utils.toArray<HTMLElement>(".smash-word", section);

      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
        (c) => {
          if (c.conditions?.still) {
            state.frame = COUNT - 1;
            seq.load(COUNT - 1).then(render);
            gsap.set(words, { opacity: 1 });
            return;
          }
          seq.load(FIRST).then(render);
          seq.preload();
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${window.innerHeight * 2.2}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
          tl.to(state, { frame: COUNT - 1, duration: 1, onUpdate: render }, 0).fromTo(
            words,
            { opacity: 0.35 },
            { opacity: 1, duration: 0.05, stagger: 0.7 / Math.max(words.length, 1) },
            0.05,
          );
        },
      );

      return () => {
        mm.revert();
        seq.destroy();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label={t.smash.title}
      className="relative h-svh min-h-[600px] overflow-hidden"
      style={{ background: BG }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />
      {/* keep the copy readable over steam and the griddle */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG}f0 30%, ${BG}99 48%, transparent 66%)` }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 pt-28 sm:px-6 md:pt-32">
        <p className="eyebrow">{t.smash.eyebrow}</p>
        <h2 className="display mt-3 max-w-5xl text-[clamp(3rem,7vw,7rem)]">{t.smash.title}</h2>
        <p className="mt-6 max-w-[46ch] text-[clamp(1.15rem,1.8vw,1.5rem)] font-medium leading-snug">
          {t.smash.body.split(" ").map((w, i) => (
            <span key={i} className="smash-word">
              {w}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
