import type { Metadata } from "next";
import Image from "next/image";
import { ClipVideo } from "@/components/shop/ClipVideo";
import { OpenItemButton } from "@/components/shop/OpenItemButton";
import { getMenu } from "@/lib/data";
import { pick } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { formatPrice } from "@/lib/pricing";
import { CATEGORIES } from "@/lib/types";

export const metadata: Metadata = { title: "Speisekarte" };

export default async function MenuPage() {
  const [{ lang, t }, menu] = await Promise.all([getDict(), getMenu()]);
  const groups = CATEGORIES.map((c) => ({ c, items: menu.filter((m) => m.category === c) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6">
      {/* A steaming double smash on slate; the title sits in the dark left side */}
      <header className="relative isolate flex aspect-[4/5] items-end overflow-hidden rounded-[var(--radius-card)] bg-[#0e130f] sm:aspect-[16/9] md:aspect-[2/1] md:items-center">
        <ClipVideo
          src="/video/hero-orbit.mp4"
          poster="/video/hero-orbit-start.webp"
          stillPoster="/video/hero-orbit-end.webp"
          className="-z-10 object-[100%_50%]"
          label={lang === "de" ? "Dampfender Doppel-Smash-Burger" : "Steaming double smash burger"}
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(90deg, rgb(14 19 15 / 0.85) 0%, rgb(14 19 15 / 0.4) 40%, transparent 65%), linear-gradient(0deg, rgb(14 19 15 / 0.7) 0%, transparent 45%)",
          }}
          aria-hidden="true"
        />
        <div className="relative p-6 md:p-12">
          <p className="eyebrow">{lang === "de" ? "Heute auf dem Grill" : "On the grill today"}</p>
          <h1 className="display mt-2 text-[clamp(3.6rem,9vw,8rem)]">{t.nav.menu}</h1>
        </div>
      </header>

      <nav
        aria-label={t.nav.menu}
        className="rail sticky top-[4.75rem] z-20 -mx-4 mt-8 flex gap-2 overflow-x-auto bg-paper/85 px-4 py-3 backdrop-blur-md sm:top-20 sm:-mx-6 sm:px-6"
      >
        {groups.map(({ c }) => (
          <a
            key={c}
            href={`#${c}`}
            className="shrink-0 rounded-full border-[1.5px] border-line px-4 py-2 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper"
          >
            {t.categories[c]}
          </a>
        ))}
      </nav>

      {groups.map(({ c, items }) => {
        const withPhotos = items.filter((i) => i.image);
        const plain = items.filter((i) => !i.image);
        return (
          <section key={c} id={c} className="scroll-mt-40 pt-12">
            <h2 className="display text-6xl">{t.categories[c]}</h2>

            {withPhotos.length > 0 ? (
              <ul className="mt-6 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {withPhotos.map((item) => (
                  <li key={item.id}>
                    <OpenItemButton slug={item.slug} className="group block w-full text-left">
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-card">
                        <Image
                          src={item.image!}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        {item.tag ? (
                          <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold">
                            {t.tags[item.tag]}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-3 flex items-baseline justify-between gap-3">
                        <span className="display text-3xl">{pick(item, "name", lang)}</span>
                        <span className="font-semibold tabular-nums">{formatPrice(item.price_cents, lang)}</span>
                      </span>
                      <span className="mt-1 block text-sm text-muted">{pick(item, "desc", lang)}</span>
                    </OpenItemButton>
                  </li>
                ))}
              </ul>
            ) : null}

            {plain.length > 0 ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {plain.map((item) => (
                  <li key={item.id}>
                    <OpenItemButton
                      slug={item.slug}
                      className="flex w-full items-center justify-between gap-4 rounded-[var(--radius-card)] bg-card px-5 py-4 text-left transition-colors hover:bg-raised"
                    >
                      <span>
                        <span className="block font-semibold">{pick(item, "name", lang)}</span>
                        <span className="block text-sm text-muted">{pick(item, "desc", lang)}</span>
                      </span>
                      <span className="font-semibold tabular-nums">{formatPrice(item.price_cents, lang)}</span>
                    </OpenItemButton>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
