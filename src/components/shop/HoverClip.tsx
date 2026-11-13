"use client";

import { useEffect, useRef } from "react";
import { getMotionPaused } from "@/lib/motion";

/**
 * Short clip laid over a menu photo that plays while the card is hovered
 * (mouse and trackpad only). Nothing downloads until the first hover.
 */
export function HoverClip({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    const card = video?.closest("button, a");
    if (!video || !card) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!fine.matches) return;

    const enter = () => {
      if (getMotionPaused()) return;
      if (!video.src) video.src = src;
      video.currentTime = 0;
      video.play().then(() => (video.style.opacity = "1")).catch(() => {});
    };
    const leave = () => {
      video.style.opacity = "0";
      video.pause();
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("focus", enter);
    card.addEventListener("blur", leave);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("focus", enter);
      card.removeEventListener("blur", leave);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className="pointer-events-none absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300"
      muted
      playsInline
      loop
      preload="none"
      aria-hidden="true"
    />
  );
}
