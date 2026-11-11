import Image from "next/image";
import Link from "next/link";
import { Bicycle, Storefront } from "@phosphor-icons/react/dist/ssr";
import { Intro } from "@/components/shop/Intro";
import { OpenItemButton } from "@/components/shop/OpenItemButton";
import { getMenu, getSettings, openNow } from "@/lib/data";
import { fill, pick } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { formatPrice } from "@/lib/pricing";

export default async function HomePage() {
  const [{ lang, t }, menu, settings] = await Promise.all([getDict(), getMenu(), getSettings()]);
  const signature = menu.find((m) => m.slug === "brutzler");
  const lineup = menu.filter((m) => m.image && (m.category === "burger" || m.category === "chicken"));
  const isOpen = openNow(settings.hours);
  const hours = [1, 2, 3, 4, 5, 6, 0].map((d) => settings.hours.find((h) => h.day === d)).filter(Boolean);

  return (
    <>
      <Intro />

      {/* Hero: left copy, right the burger the intro just built */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pt-16">
        <div>
          <p
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
              isOpen ? "bg-pickle/15 text-pickle" : "bg-line text-muted"
            }`}
          >
            <span className={`size-2 rounded-full ${isOpen ? "bg-pickle" : "bg-muted"}`} aria-hidden />
            {isOpen ? t.hero.openNow : t.hero.closedNow}
          </p>
          <h1 className="display mt-5 max-w-[15ch] text-[clamp(3.4rem,6.6vw,6.4rem)]">{t.hero.title}</h1>
          <p className="mt-6 max-w-[42ch] text-lg text-muted">{t.hero.sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary text-lg">
              {t.hero.cta}
            </Link>
            <Link href="#visit" className="btn btn-ghost text-lg">
              {t.nav.hours}
            </Link>
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-grill">
          <Image
            src="/img/b6.jpg"
            alt={lang === "de" ? "Speckig Burger mit Bacon und Cheddar" : "Bacon Stack burger with cheddar"}
            fill
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Signature: dark band, photo bleeds left */}
      {signature ? (
        <section className="bg-grill text-grill-ink">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
            <div className="relative aspect-[6/5] overflow-hidden rounded-[var(--radius-card)]">
              <Image src="/img/b1.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="md:pl-6">
              <h2 className="display text-[clamp(3.2rem,7vw,6rem)] text-ketchup">{t.signature.title}</h2>
              <p className="mt-5 max-w-[46ch] text-lg opacity-85">{t.signature.body}</p>
              <div className="mt-8 flex items-center gap-5">
                <span className="display text-5xl tabular-nums">{formatPrice(signature.price_cents, lang)}</span>
                <OpenItemButton slug="brutzler" label={t.signature.add} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Line-up rail */}
      <section className="py-16 md:py-24">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6">
          <h2 className="display text-[clamp(2.6rem,5vw,4.2rem)]">{t.lineup.title}</h2>
          <Link href="/menu" className="shrink-0 font-semibold underline-offset-4 hover:underline">
            {t.lineup.all}
          </Link>
        </div>
        <ul className="rail mt-8 flex gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {lineup.map((item) => (
            <li key={item.id} className="w-[72vw] max-w-[300px] shrink-0">
              <OpenItemButton slug={item.slug} className="group block w-full text-left">
                <span className="relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-grill">
                  <Image
                    src={item.image!}
                    alt=""
                    fill
                    sizes="300px"
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
              </OpenItemButton>
            </li>
          ))}
        </ul>
      </section>

      {/* Pickup / delivery */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24">
        <h2 className="display text-[clamp(2.6rem,5vw,4.2rem)]">{t.ways.title}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="relative min-h-[320px] overflow-hidden rounded-[var(--radius-card)] bg-grill text-grill-ink">
            <Image src="/img/b8.jpg" alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover opacity-55" />
            <div className="relative flex h-full flex-col justify-end p-7">
              <Storefront size={34} weight="duotone" />
              <h3 className="display mt-3 text-5xl">{t.ways.pickupTitle}</h3>
              <p className="mt-2 max-w-[38ch] opacity-90">{t.ways.pickupBody}</p>
            </div>
          </div>
          <div className="flex min-h-[320px] flex-col justify-end rounded-[var(--radius-card)] bg-ketchup p-7 text-ketchup-ink">
            <Bicycle size={34} weight="duotone" />
            <h3 className="display mt-3 text-5xl">{t.ways.deliveryTitle}</h3>
            <p className="mt-2 max-w-[38ch] opacity-95">
              {fill(t.ways.deliveryBody, {
                min: formatPrice(settings.delivery.min_cents, lang),
                fee: formatPrice(settings.delivery.fee_cents, lang),
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <h2 className="display text-[clamp(2.6rem,5vw,4.2rem)]">{t.visit.title}</h2>
            <p className="mt-4 text-2xl font-medium">{t.visit.address}</p>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2.5 self-end text-lg">
            {hours.map((h) => (
              <div key={h!.day} className="contents">
                <dt className="font-medium">{t.days[h!.day]}</dt>
                <dd className="tabular-nums text-muted">{h!.closed ? t.visit.closed : `${h!.open} - ${h!.close}`}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
