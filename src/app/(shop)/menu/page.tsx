import type { Metadata } from "next";
import Image from "next/image";
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
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <h1 className="display text-[clamp(3.4rem,8vw,6.5rem)]">{t.nav.menu}</h1>

      <nav
        aria-label={t.nav.menu}
        className="rail sticky top-16 z-20 -mx-4 mt-6 flex gap-2 overflow-x-auto border-b border-line bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6"
      >
        {groups.map(({ c }) => (
          <a
            key={c}
            href={`#${c}`}
            className="shrink-0 rounded-full border-[1.5px] border-line px-4 py-2 text-sm font-semibold hover:border-ink"
          >
            {t.categories[c]}
          </a>
        ))}
      </nav>

      {groups.map(({ c, items }) => {
        const withPhotos = items.filter((i) => i.image);
        const plain = items.filter((i) => !i.image);
        return (
          <section key={c} id={c} className="scroll-mt-36 pt-12">
            <h2 className="display text-5xl">{t.categories[c]}</h2>

            {withPhotos.length > 0 ? (
              <ul className="mt-6 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {withPhotos.map((item) => (
                  <li key={item.id}>
                    <OpenItemButton slug={item.slug} className="group block w-full text-left">
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-grill">
                        <Image
                          src={item.image!}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        {item.tag ? (
                          <span className="absolute left-3 top-3 rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-ink">
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
                      className="flex w-full items-center justify-between gap-4 rounded-[var(--radius-card)] bg-card px-5 py-4 text-left hover:ring-[1.5px] hover:ring-ink"
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
