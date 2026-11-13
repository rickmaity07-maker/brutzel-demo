import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { BRAND } from "@/brand.config";
import { ClipVideo } from "./ClipVideo";
import { OpenItemButton } from "./OpenItemButton";

/** Instagram-style wall of short clips; each tile opens the dish it shows. */
const TILES = [
  { clip: "burger-build", slug: "brutzler" },
  { clip: "fries", slug: "pommes" },
  { clip: "shake", slug: "keksshake" },
  { clip: "smash-melt", slug: "doppeldecker" },
  { clip: "chicken", slug: "knusper" },
  { clip: "redlight", slug: "rotlicht" },
];

export function ClipGrid({ title }: { title: string }) {
  return (
    <section className="bg-paper pb-24 pt-20 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-[clamp(2.6rem,5vw,4.6rem)]">{title}</h2>
          <p className="inline-flex items-center gap-2 font-semibold">
            <InstagramLogo size={22} weight="bold" className="text-ketchup" aria-hidden />@{BRAND.instagram}
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {TILES.map((tile) => (
            <li key={tile.clip}>
              <OpenItemButton
                slug={tile.slug}
                namedAfterItem
                className="group relative block aspect-square w-full overflow-hidden rounded-[var(--radius-field)] bg-card"
              >
                <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
                  <ClipVideo src={`/video/hover/${tile.clip}.mp4`} poster={`/video/hover/${tile.clip}.webp`} loop />
                </span>
                <span className="absolute inset-0 grid place-items-center bg-grill/0 transition-colors duration-300 group-hover:bg-grill/40">
                  <InstagramLogo
                    size={30}
                    weight="bold"
                    className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                </span>
              </OpenItemButton>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
