"use client";

import { useMemo, useState } from "react";
import { Check, Plus, ShoppingBag } from "@phosphor-icons/react";
import { useLang } from "@/components/LangProvider";
import { pick } from "@/lib/i18n";
import { formatPrice, priceCart } from "@/lib/pricing";
import { useShop } from "./ShopProvider";

/* ---------- illustrated layers (each one its own little SVG) ---------- */

const W = 320;
type Layer = { id: string; h: number; overlap: number; svg: React.ReactNode };

const sesame = [
  [70, 40], [104, 26], [140, 36], [176, 22], [212, 34], [248, 44], [92, 58], [128, 54],
  [164, 48], [200, 56], [236, 62], [150, 70], [116, 76], [186, 74],
];

const layers = {
  bottomBun: {
    h: 56,
    overlap: 0,
    svg: (
      <>
        <defs>
          <linearGradient id="bb" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#f3c27a" />
            <stop offset="0.25" stopColor="#d98b3a" />
            <stop offset="1" stopColor="#9c5419" />
          </linearGradient>
        </defs>
        <path d="M14 8 H306 Q312 8 310 16 Q298 54 160 54 Q22 54 10 16 Q8 8 14 8 Z" fill="url(#bb)" />
        <path d="M14 8 H306" stroke="#f7d9a6" strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  },
  patty: {
    h: 42,
    overlap: 3,
    svg: (
      <>
        <defs>
          <linearGradient id="pt" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6b3418" />
            <stop offset="0.5" stopColor="#4a220f" />
            <stop offset="1" stopColor="#2b1308" />
          </linearGradient>
        </defs>
        <path
          d="M6 14 Q2 6 14 6 L40 3 L70 7 L100 2 L140 6 L180 2 L220 6 L260 2 L300 6 Q318 6 314 16 L316 28 Q314 40 296 40 L250 38 L200 41 L150 38 L100 41 L50 38 L18 40 Q4 40 6 28 Z"
          fill="url(#pt)"
        />
        <path d="M20 12 Q80 18 140 12 T300 14" stroke="#8a4a24" strokeWidth="3" fill="none" opacity="0.7" />
      </>
    ),
  },
  veggiePatty: {
    h: 42,
    overlap: 3,
    svg: (
      <>
        <defs>
          <linearGradient id="vp" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8b8f3c" />
            <stop offset="1" stopColor="#4a5020" />
          </linearGradient>
        </defs>
        <rect x="8" y="4" width="304" height="36" rx="16" fill="url(#vp)" />
        {[40, 90, 150, 210, 270].map((x) => (
          <circle key={x} cx={x} cy={18 + (x % 3) * 4} r="4" fill="#c9b45a" opacity="0.8" />
        ))}
      </>
    ),
  },
  cheese: {
    h: 22,
    overlap: 5,
    svg: (
      <path
        d="M4 4 H316 L310 10 L292 10 L286 22 L278 10 L210 10 L200 20 L190 10 L120 10 L112 22 L104 10 L40 10 L32 18 L24 10 L8 10 Z"
        fill="#f4b62a"
        stroke="#e09a12"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  bacon: {
    h: 20,
    overlap: 1,
    svg: (
      <>
        <path d="M2 10 Q28 0 54 10 T106 10 T158 10 T210 10 T262 10 T318 10 L318 18 Q292 8 266 18 T214 18 T162 18 T110 18 T58 18 T2 18 Z" fill="#a8392a" />
        <path d="M2 13 Q28 4 54 13 T106 13 T158 13 T210 13 T262 13 T318 13" stroke="#f0a58f" strokeWidth="2.5" fill="none" />
      </>
    ),
  },
  avocado: {
    h: 20,
    overlap: 1,
    svg: (
      <>
        {[38, 98, 158, 218, 278].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="10" rx="32" ry="9" fill="#4f7a2a" />
            <ellipse cx={x} cy="10" rx="28" ry="7" fill="#b6d36a" />
          </g>
        ))}
      </>
    ),
  },
  lettuce: {
    h: 24,
    overlap: 3,
    svg: (
      <path
        d="M0 12 Q12 2 24 12 T48 12 T72 12 T96 12 T120 12 T144 12 T168 12 T192 12 T216 12 T240 12 T264 12 T288 12 T320 12 L314 20 Q300 14 286 22 T258 20 T230 22 T202 20 T174 22 T146 20 T118 22 T90 20 T62 22 T34 20 T6 20 Z"
        fill="#7cb342"
        stroke="#5c8f2c"
        strokeWidth="1.5"
      />
    ),
  },
  tomato: {
    h: 18,
    overlap: 1,
    svg: (
      <>
        {[62, 160, 258].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="9" rx="52" ry="8" fill="#c62f22" />
            <ellipse cx={x} cy="8" rx="44" ry="5" fill="#e8513f" />
          </g>
        ))}
      </>
    ),
  },
  jalapenos: {
    h: 16,
    overlap: 1,
    svg: (
      <>
        {[50, 104, 160, 216, 270].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="8" rx="17" ry="7" fill="#2f7a2e" />
            <ellipse cx={x} cy="8" rx="10" ry="4" fill="#a7d36b" />
          </g>
        ))}
      </>
    ),
  },
  topBun: {
    h: 100,
    overlap: 3,
    svg: (
      <>
        <defs>
          <radialGradient id="tb" cx="0.38" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#f6c27a" />
            <stop offset="0.45" stopColor="#dc8a35" />
            <stop offset="1" stopColor="#9a4f15" />
          </radialGradient>
        </defs>
        <path d="M8 96 Q4 90 8 80 Q30 6 160 4 Q290 6 312 80 Q316 90 312 96 Z" fill="url(#tb)" />
        {sesame.map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="5" ry="2.6" fill="#fff1d2" transform={`rotate(${(i * 37) % 60 - 30} ${x} ${y})`} />
        ))}
      </>
    ),
  },
} satisfies Record<string, Omit<Layer, "id">>;

function Stack({ veggie, extras }: { veggie: boolean; extras: Set<string> }) {
  const stack: Layer[] = [];
  const push = (id: string, key: keyof typeof layers) => stack.push({ id, ...layers[key] });
  push("bottomBun", "bottomBun");
  push("patty", veggie ? "veggiePatty" : "patty");
  if (extras.has("patty")) push("patty2", veggie ? "veggiePatty" : "patty");
  push("cheese", "cheese");
  if (extras.has("kaese")) push("cheese2", "cheese");
  if (extras.has("bacon")) push("bacon", "bacon");
  if (extras.has("avocado")) push("avocado", "avocado");
  push("lettuce", "lettuce");
  push("tomato", "tomato");
  if (extras.has("jalapenos")) push("jalapenos", "jalapenos");
  push("topBun", "topBun");

  return (
    <div className="flex flex-col-reverse items-center" aria-hidden="true">
      {stack.map((l) => (
        <svg
          key={l.id}
          viewBox={`0 0 ${W} ${l.h}`}
          className="burger-drop w-[min(78vw,320px)] overflow-visible drop-shadow-[0_6px_10px_rgb(0_0_0/0.35)]"
          style={{ marginBottom: -l.overlap }}
        >
          {l.svg}
        </svg>
      ))}
    </div>
  );
}

/* ---------- the builder ---------- */

export function BurgerBuilder() {
  const { lang, t } = useLang();
  const { menu, extras, comboCents, add, setDrawerOpen } = useShop();
  const bases = useMemo(() => menu.filter((m) => m.category === "burger" && m.available), [menu]);
  const drinks = useMemo(() => menu.filter((m) => m.category === "drinks" && m.available), [menu]);
  const usable = extras.filter((e) => e.available);

  const [baseId, setBaseId] = useState<number | null>(bases[0]?.id ?? null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [combo, setCombo] = useState(false);
  const [drink, setDrink] = useState<string | null>(drinks[0]?.slug ?? null);
  const [added, setAdded] = useState(false);

  const base = bases.find((b) => b.id === baseId) ?? bases[0];
  if (!base) return null;

  const line = { itemId: base.id, qty: 1, extras: [...chosen], combo: combo && !!drink, comboDrink: combo ? drink : null };
  const priced = priceCart([line], menu, extras, comboCents);
  const total = priced.ok ? priced.subtotalCents : base.price_cents;

  const toggle = (slug: string) => {
    setAdded(false);
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      {/* stage */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative grid min-h-[440px] place-items-end overflow-hidden rounded-[var(--radius-card)] bg-studio px-6 pb-12 pt-16 text-studio-ink sm:min-h-[520px]">
          <div
            className="pointer-events-none absolute inset-x-10 bottom-8 h-10 rounded-[50%] bg-black/15 blur-xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto">
            <Stack veggie={base.tag === "veggie"} extras={chosen} />
          </div>
          <div className="absolute left-5 top-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studio-ink/60">{t.builder.total}</p>
            <p className="display mt-1 text-3xl">{pick(base, "name", lang)}</p>
          </div>
          <p className="display absolute right-5 top-5 text-4xl tabular-nums" aria-live="polite">
            {formatPrice(total, lang)}
          </p>
        </div>
      </div>

      {/* controls */}
      <div className="space-y-10">
        <fieldset>
          <legend className="display text-3xl">{t.builder.base}</legend>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {bases.map((b) => {
              const on = b.id === base.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setBaseId(b.id);
                    setAdded(false);
                  }}
                  className={`rounded-[var(--radius-field)] border-[1.5px] p-3 text-left transition-colors ${
                    on ? "border-ketchup bg-ketchup/15" : "border-line hover:border-ink/40"
                  }`}
                >
                  <span className="block font-semibold leading-tight">{pick(b, "name", lang)}</span>
                  <span className="mt-1 block text-sm tabular-nums text-muted">{formatPrice(b.price_cents, lang)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="display text-3xl">{t.builder.extras}</legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {usable.map((e) => {
              const on = chosen.has(e.slug);
              return (
                <button
                  key={e.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(e.slug)}
                  className={`flex items-center gap-3 rounded-[var(--radius-field)] border-[1.5px] p-3 text-left transition-colors ${
                    on ? "border-ketchup bg-ketchup/15" : "border-line hover:border-ink/40"
                  }`}
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full transition-colors ${
                      on ? "bg-ketchup text-ketchup-ink" : "bg-raised"
                    }`}
                  >
                    {on ? <Check size={14} weight="bold" aria-hidden /> : <Plus size={14} weight="bold" aria-hidden />}
                  </span>
                  <span className="flex-1 font-semibold">{pick(e, "name", lang)}</span>
                  <span className="text-sm tabular-nums text-muted">+{formatPrice(e.price_cents, lang)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {drinks.length > 0 ? (
          <fieldset>
            <legend className="sr-only">{t.builder.combo}</legend>
            <button
              type="button"
              aria-pressed={combo}
              onClick={() => {
                setCombo((c) => !c);
                setAdded(false);
              }}
              className={`flex w-full items-center gap-3 rounded-[var(--radius-field)] border-[1.5px] p-4 text-left transition-colors ${
                combo ? "border-ketchup bg-ketchup/15" : "border-line hover:border-ink/40"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full ${combo ? "bg-ketchup text-ketchup-ink" : "bg-raised"}`}
              >
                {combo ? <Check size={14} weight="bold" aria-hidden /> : <Plus size={14} weight="bold" aria-hidden />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{t.builder.combo}</span>
                <span className="block text-sm text-muted">{t.builder.comboHint}</span>
              </span>
              <span className="text-sm tabular-nums text-muted">+{formatPrice(comboCents, lang)}</span>
            </button>
            {combo ? (
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={t.builder.drink}>
                {drinks.map((d) => (
                  <button
                    key={d.slug}
                    type="button"
                    role="radio"
                    aria-checked={drink === d.slug}
                    onClick={() => setDrink(d.slug)}
                    className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition-colors ${
                      drink === d.slug ? "border-ink bg-ink text-paper" : "border-line hover:border-ink/40"
                    }`}
                  >
                    {pick(d, "name", lang)}
                  </button>
                ))}
              </div>
            ) : null}
          </fieldset>
        ) : null}

        <button
          type="button"
          disabled={!priced.ok}
          onClick={() => {
            add(line);
            setAdded(true);
            setDrawerOpen(true);
          }}
          className="btn btn-primary w-full justify-between px-6 py-4 text-lg"
        >
          <span className="inline-flex items-center gap-2">
            {added ? <Check size={20} weight="bold" aria-hidden /> : <ShoppingBag size={20} weight="bold" aria-hidden />}
            {added ? t.builder.added : t.builder.add}
          </span>
          <span className="tabular-nums">{formatPrice(total, lang)}</span>
        </button>
      </div>
    </div>
  );
}
