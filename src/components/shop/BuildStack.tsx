"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLang } from "@/components/LangProvider";
import { createFrameSequence, type Rect } from "@/lib/frameSequence";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BASE = "/frames/brutzler";
const FRAME_COUNT = 190;
/** Frame where each layer starts dropping, matched to the clip by eye. */
const STEP_STARTS = [0, 7, 24, 50, 70, 118, 144];
const DONE_FRAME = 163;
/** The clip's studio background, so the canvas edges disappear into the section. */
const STUDIO_BG = "#efefea";

/** Burger kept large but never cropped (it spans ≈34% of the clip width); shifted right on wide screens. */
function place(cw: number, ch: number, iw: number, ih: number): Rect {
  const wide = cw >= 768;
  const cover = Math.max(cw / iw, ch / ih);
  const s = Math.min(cover, (cw * (wide ? 0.52 : 0.74)) / (iw * 0.34));
  const w = iw * s;
  const h = ih * s;
  const y = h >= ch ? (ch - h) / 2 : ch * (wide ? 0.5 : 0.53) - h / 2;
  return { x: cw * (wide ? 0.6 : 0.5) - w / 2, y, w, h };
}

/** When the clip doesn't fill the height, feather its top/bottom edge into the section. */
function feather(ctx: CanvasRenderingContext2D, r: Rect, cw: number) {
  if (r.y <= 0) return;
  const fade = Math.min(80, r.h * 0.15);
  for (const [from, to] of [
    [r.y, r.y + fade],
    [r.y + r.h, r.y + r.h - fade],
  ]) {
    const g = ctx.createLinearGradient(0, from, 0, to);
    g.addColorStop(0, STUDIO_BG);
    g.addColorStop(1, `${STUDIO_BG}00`);
    ctx.fillStyle = g;
    ctx.fillRect(0, Math.min(from, to), cw, fade);
  }
}

/**
 * Scroll-scrubbed burger build: the section pins and scrolling plays the
 * Flow clip frame by frame, while the step list follows each layer.
 */
export function BuildStack() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const section = root.current;
      const canvas = canvasRef.current;
      if (!section || !canvas) return;

      const seq = createFrameSequence(canvas, { base: BASE, count: FRAME_COUNT, bg: STUDIO_BG, place, after: feather });
      const state = { frame: 0 };

      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
        (c) => {
          if (c.conditions?.still) {
            // no scrubbing: show the finished burger and the whole list
            seq.load(FRAME_COUNT - 1).then(() => seq.set(FRAME_COUNT - 1));
            setStep(STEP_STARTS.length - 1);
            setDone(true);
            return;
          }
          seq.load(0).then(() => seq.set(state.frame));
          seq.preload();
          gsap.to(state, {
            frame: FRAME_COUNT - 1,
            ease: "none",
            onUpdate: () => {
              seq.set(state.frame);
              const f = state.frame;
              let s = 0;
              while (s + 1 < STEP_STARTS.length && f >= STEP_STARTS[s + 1]) s++;
              setStep(s);
              setDone(f >= DONE_FRAME);
            },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${window.innerHeight * 2.6}`,
              pin: true,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          });
        },
      );

      return () => {
        mm.revert();
        seq.destroy();
      };
    },
    { scope: root },
  );

  const steps = t.build.steps;

  return (
    <section
      ref={root}
      aria-label={t.build.title}
      className="relative h-svh min-h-[560px] overflow-hidden text-[#1c1f1a]"
      style={{ background: STUDIO_BG }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col px-4 pb-8 pt-20 sm:px-6 md:pt-24">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d62b1f]">{t.build.eyebrow}</p>
        <h2 className="display mt-2 max-w-[12ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95]">{t.build.title}</h2>

        {/* desktop: the full layer list, current layer highlighted */}
        <ol className="mt-8 hidden max-w-[22rem] space-y-2.5 md:block">
          {steps.map((label, i) => (
            <li
              key={label}
              className={`flex items-baseline gap-3 text-lg transition-[opacity,transform] duration-300 ${
                i === step ? "translate-x-1.5 font-semibold opacity-100" : i < step ? "opacity-55" : "opacity-25"
              }`}
            >
              <span className={`tabular-nums text-sm ${i <= step ? "text-[#d62b1f]" : ""}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {label}
            </li>
          ))}
        </ol>

        {/* mobile: only the current layer, under the burger */}
        <p className="mt-auto text-center text-xl font-semibold md:hidden" aria-live="polite">
          <span className="mr-2 text-sm tabular-nums text-[#d62b1f]">{String(step + 1).padStart(2, "0")}</span>
          {steps[step]}
        </p>

        <div
          className={`mt-5 flex justify-center transition-[opacity,transform] duration-500 md:mt-auto md:justify-start ${
            done ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          <Link href="/menu" className="btn btn-primary text-lg" tabIndex={done ? 0 : -1}>
            {t.build.cta}
          </Link>
        </div>

        <div className="absolute inset-x-4 bottom-0 h-1 overflow-hidden rounded-full bg-[#1c1f1a]/10 sm:inset-x-6" aria-hidden="true">
          <div
            className="h-full bg-[#d62b1f] transition-[width] duration-300"
            style={{ width: `${((step + (done ? 1 : 0)) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
