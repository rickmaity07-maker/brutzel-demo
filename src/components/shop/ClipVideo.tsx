"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
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
 * Muted Flow clip as a <video>. Plays when it scrolls into view; loops pause
 * again off screen so only the visible section decodes.
 */
export function ClipVideo({ src, poster, stillPoster, loop = false, label, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (stillPoster) video.poster = stillPoster;
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (loop || !video.ended) video.play().catch(() => {});
        } else if (loop) {
          video.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [loop, stillPoster]);

  return (
    <video
      ref={ref}
      className={`pointer-events-none absolute inset-0 size-full object-cover ${className}`}
      poster={poster}
      muted
      playsInline
      loop={loop}
      preload={loop ? "none" : "auto"}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
