"use client";

import { useEffect, useRef } from "react";
import { useMotionPaused } from "@/lib/motion";

type Props = {
  src: string;
  /** lighter encode for screens under 768px */
  srcMobile?: string;
  /** frame shown before playback starts */
  poster: string;
  /** frame shown instead of playing when the visitor prefers reduced motion */
  stillPoster?: string;
  /** background loops repeat; one-shot clips play once and hold the last frame */
  loop?: boolean;
  /** accessible description; omit for decorative backgrounds */
  label?: string;
  className?: string;
};

/**
 * Muted Flow clip as a <video>. The file is only attached once the clip is
 * near the viewport (phones get the lighter encode), it plays in view, loops
 * pause off screen, and the site-wide pause switch stops everything.
 */
export function ClipVideo({ src, srcMobile, poster, stillPoster, loop = false, label, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useRef(false);
  const paused = useMotionPaused();
  const pausedRef = useRef(paused);
  // the IntersectionObserver callbacks read the latest pause state from here
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (stillPoster) video.poster = stillPoster;
      return;
    }
    const file = srcMobile && window.matchMedia("(max-width: 767px)").matches ? srcMobile : src;

    const attach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        attach.disconnect();
        video.preload = loop ? "metadata" : "auto";
        video.src = file;
      },
      { rootMargin: "600px 0px" },
    );
    const play = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (!pausedRef.current && (loop || !video.ended)) video.play().catch(() => {});
        } else if (loop) {
          video.pause();
        }
      },
      { threshold: 0.15 },
    );
    attach.observe(video);
    play.observe(video);
    return () => {
      attach.disconnect();
      play.disconnect();
    };
  }, [src, srcMobile, loop, stillPoster]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !video.src) return;
    if (paused) video.pause();
    else if (inView.current && (loop || !video.ended)) video.play().catch(() => {});
  }, [paused, loop]);

  return (
    <video
      ref={ref}
      className={`pointer-events-none absolute inset-0 size-full object-cover ${className}`}
      poster={poster}
      muted
      playsInline
      loop={loop}
      preload="none"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    />
  );
}
