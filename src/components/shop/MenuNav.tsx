"use client";

import { useEffect, useRef, useState } from "react";

/** Sticky category bar that highlights the section in view and keeps its chip visible. */
export function MenuNav({ items, label }: { items: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      // a thin band just under the sticky bar decides which section is "current"
      { rootMargin: "-160px 0px -70% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    const chip = bar.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    const rail = bar.current;
    if (!chip || !rail) return;
    rail.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      ref={bar}
      aria-label={label}
      className="rail sticky top-[4.75rem] z-20 -mx-4 mt-8 flex gap-2 overflow-x-auto bg-paper/85 px-4 py-3 backdrop-blur-md sm:top-20 sm:-mx-6 sm:px-6"
    >
      {items.map((i) => {
        const on = i.id === active;
        return (
          <a
            key={i.id}
            data-id={i.id}
            href={`#${i.id}`}
            aria-current={on ? "true" : undefined}
            className={`shrink-0 rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition-colors ${
              on ? "border-ketchup bg-ketchup text-ketchup-ink" : "border-line hover:border-ink hover:bg-ink hover:text-paper"
            }`}
          >
            {i.label}
          </a>
        );
      })}
    </nav>
  );
}
