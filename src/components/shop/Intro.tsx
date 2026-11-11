"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLang } from "@/components/LangProvider";
import { INTRO_SEEN_KEY } from "./introGate";

gsap.registerPlugin(useGSAP);

const SEEN_KEY = INTRO_SEEN_KEY;
const LAYERS = 5;

/**
 * The burger photo is cut into five horizontal layers that drop onto each other
 * bottom bun first, then the wordmark slams in and the overlay wipes away.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || document.documentElement.dataset.introSeen) return;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      document.documentElement.style.overflow = "hidden";

      const finish = () => {
        document.documentElement.style.overflow = "";
        document.documentElement.dataset.introSeen = "1";
      };
      const layers = gsap.utils.toArray<HTMLElement>(".intro-layer", el).reverse(); // bottom bun first
      const tl = gsap.timeline({ onComplete: finish, defaults: { ease: "power3.in" } });
      tl.set(".intro-layer, .intro-letter", { visibility: "visible" })
        .from(layers, { yPercent: -900, duration: 0.42, stagger: 0.16 })
        .to(layers, { scaleY: 0.86, duration: 0.07, stagger: 0.16, ease: "power1.out", yoyo: true, repeat: 1 }, 0.38)
        .from(".intro-letter", { yPercent: 110, duration: 0.5, stagger: 0.035, ease: "back.out(2.2)" }, "-=0.15")
        .to(".intro-stack", { scale: 0.92, duration: 0.5, ease: "power2.inOut" }, "<")
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power4.inOut" }, "+=0.35");

      const skip = () => tl.progress(1);
      el.querySelector("button")?.addEventListener("click", skip);
      return () => {
        tl.kill();
        finish();
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="intro fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#020202]"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      aria-hidden="true"
    >
      <div className="intro-stack relative aspect-square w-[min(62vmin,460px)]">
        {Array.from({ length: LAYERS }, (_, i) => (
          <div
            key={i}
            className="intro-layer absolute inset-x-0 origin-bottom"
            style={{
              top: `${(i * 100) / LAYERS}%`,
              height: `${100 / LAYERS + 0.4}%`,
              backgroundImage: "url(/img/b6.jpg)",
              backgroundSize: "100% auto",
              backgroundPosition: `0 ${(i * 100) / (LAYERS - 1)}%`,
            }}
          />
        ))}
      </div>
      <p className="display flex overflow-hidden pb-1 text-[clamp(3.5rem,13vw,8rem)] text-ketchup">
        {"BRUTZEL".split("").map((ch, i) => (
          <span key={i} className="intro-letter inline-block">
            {ch}
          </span>
        ))}
      </p>
      <button
        type="button"
        tabIndex={-1}
        className="absolute bottom-6 right-6 rounded-full border border-grill-ink/30 px-4 py-2 text-sm text-grill-ink/80 hover:text-grill-ink"
      >
        {t.intro.skip}
      </button>
    </div>
  );
}
