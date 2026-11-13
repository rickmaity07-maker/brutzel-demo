import { Plus } from "@phosphor-icons/react/dist/ssr";
import { ClipVideo } from "@/components/shop/ClipVideo";
import { FramePlayer } from "@/components/shop/FramePlayer";
import { OpenItemButton } from "@/components/shop/OpenItemButton";
import { pick } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import type { Lang, MenuItem } from "@/lib/types";
import type { Focus } from "@/lib/frameSequence";

type Tile = {
  slug: string;
  base: string;
  bg: string;
  focus: Focus;
  /** grid placement on md+ (4 columns × 2 rows, dense, no gaps) */
  span: string;
  /** height on mobile */
  mobile: string;
};

/*
  4 × 2 grid, every cell filled:
  row 1: shake (c1, spans both rows) | fries (c2-3) | chicken (c4)
  row 2: shake                       | red light (c2-3) | signature card (c4)
*/
const TILES: Tile[] = [
  {
    slug: "keksshake",
    base: "/frames/shake",
    bg: "#c3321f",
    focus: { x: 0.5, y: 0.55, zoom: 1.05 },
    span: "md:row-span-2",
    mobile: "aspect-[4/5]",
  },
  {
    slug: "pommes",
    base: "/frames/fries",
    bg: "#0f1310",
    focus: { x: 0.5, y: 0.6, zoom: 1.35 },
    span: "md:col-span-2",
    mobile: "aspect-[16/10]",
  },
  {
    slug: "knusper",
    base: "/frames/chicken",
    bg: "#ecede5",
    focus: { x: 0.53, y: 0.6, zoom: 1.25 },
    span: "",
    mobile: "aspect-[4/3]",
  },
  {
    slug: "rotlicht",
    base: "/frames/redlight",
    bg: "#ecede5",
    focus: { x: 0.5, y: 0.58, zoom: 1.35 },
    span: "md:col-span-2",
    mobile: "aspect-[16/10]",
  },
];

export function ClipBento(props: {
  menu: MenuItem[];
  lang: Lang;
  title: string;
  signature?: MenuItem;
  signatureTitle: string;
  signatureBody: string;
  addLabel: string;
}) {
  const { menu, lang } = props;
  return (
    <section className="surface-ember relative isolate overflow-hidden">
      {/* embers rise behind the grid; screen blend drops the clip's black */}
      <ClipVideo
        src="/video/bg-embers.mp4"
        srcMobile="/video/bg-embers-m.mp4"
        poster="/video/bg-embers.webp"
        loop
        className="-z-10 opacity-70 mix-blend-screen"
      />
      <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 md:py-40">
        <h2 className="display max-w-5xl text-[clamp(3rem,7vw,6.5rem)]">
          {props.title}
        </h2>

        <div className="mt-12 grid grid-flow-dense grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-[repeat(2,minmax(0,23rem))]">
          {TILES.map((tile) => {
            const item = menu.find((m) => m.slug === tile.slug);
            if (!item) return null;
            const name = pick(item, "name", lang);
            return (
              <OpenItemButton
                key={tile.slug}
                slug={tile.slug}
                className={`group relative block overflow-hidden rounded-[var(--radius-card)] text-left ${tile.span} ${tile.mobile} md:aspect-auto`}
              >
                <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                  <FramePlayer
                    base={tile.base}
                    count={199}
                    bg={tile.bg}
                    mode="play"
                    focus={tile.focus}
                    label={name}
                  />
                </span>
                <span className="glass absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-full py-2 pl-4 pr-2">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPrice(item.price_cents, lang)}
                    </span>
                    <span className="grid size-8 place-items-center rounded-full bg-ketchup text-ketchup-ink transition-transform duration-300 group-hover:rotate-90">
                      <Plus size={16} weight="bold" aria-hidden />
                    </span>
                  </span>
                </span>
              </OpenItemButton>
            );
          })}

          {props.signature ? (
            <div className="flex flex-col justify-between rounded-[var(--radius-card)] bg-ketchup p-6 text-ketchup-ink">
              <div>
                <p className="display text-5xl">{props.signatureTitle}</p>
                <p className="mt-3 text-sm leading-relaxed opacity-90">
                  {props.signatureBody}
                </p>
              </div>
              <div className="mt-6 flex items-end justify-between gap-3">
                <span className="display text-5xl tabular-nums">
                  {formatPrice(props.signature.price_cents, lang)}
                </span>
                <OpenItemButton
                  slug={props.signature.slug}
                  className="btn bg-ketchup-ink px-5 py-3 text-sm text-ketchup hover:bg-white"
                  label={props.addLabel}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
