import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bicycle,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import { BuildStack } from "@/components/shop/BuildStack";
import { ClipBento } from "@/components/shop/ClipBento";
import { ClipVideo } from "@/components/shop/ClipVideo";
import { Marquee } from "@/components/shop/Marquee";
import { OpenItemButton } from "@/components/shop/OpenItemButton";
import { SmashChapter } from "@/components/shop/SmashChapter";
import { getMenu, getSettings } from "@/lib/data";
import { fill, pick } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { formatPrice } from "@/lib/pricing";

const HERO_BG = "#111517";

export default async function HomePage() {
  const [{ lang, t }, menu, settings] = await Promise.all([
    getDict(),
    getMenu(),
    getSettings(),
  ]);
  const signature = menu.find((m) => m.slug === "brutzler");
  const lineup = menu.filter(
    (m) => m.image && (m.category === "burger" || m.category === "chicken"),
  );
  const hours = [1, 2, 3, 4, 5, 6, 0]
    .map((d) => settings.hours.find((h) => h.day === d))
    .filter(Boolean);

  return (
    <>
      {/* Hero: the burger's layers float in zero gravity and stack themselves */}
      <section
        className="relative -mt-24 flex min-h-[100svh] items-end overflow-hidden"
        style={{ background: HERO_BG }}
      >
        {/* the clip pushes in on the burger, so it plays in a soft-edged window right of the headline */}
        <div className="feather-edges absolute left-0 top-16 -ml-[50vw] aspect-video w-[150vw] md:left-auto md:top-1/2 md:-right-[2vw] md:ml-0 md:w-[min(80vw,150svh)] md:-translate-y-[46%]">
          <ClipVideo
            src="/video/hero-zerog.mp4"
            poster="/video/hero-zerog-start.webp"
            stillPoster="/video/hero-zerog-end.webp"
            label={
              lang === "de"
                ? "Die Zutaten eines Burgers schweben und stapeln sich"
                : "A burger's ingredients float and stack themselves"
            }
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${HERO_BG}e6 0%, ${HERO_BG}99 32%, transparent 55%), radial-gradient(120% 90% at 72% 45%, transparent 35%, ${HERO_BG}aa 75%), linear-gradient(0deg, var(--paper) 0%, transparent 38%)`,
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 md:pb-24">
          <h1 className="display max-w-4xl text-[clamp(3.6rem,7vw,7.5rem)]">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg text-ink/95 md:text-xl">
            {t.hero.sub}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary text-lg">
              {t.hero.cta}
              <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
            <Link href="#visit" className="btn btn-ghost text-lg">
              {t.nav.hours}
            </Link>
          </div>
        </div>
      </section>

      <Marquee words={t.marquee} />

      <SmashChapter />

      <BuildStack />

      <ClipBento
        menu={menu}
        lang={lang}
        title={t.bento.title}
        signature={signature}
        signatureTitle={t.signature.title}
        signatureBody={t.signature.body}
        addLabel={t.signature.add}
      />

      {/* Line-up rail: the ingredients lay themselves out behind the heading */}
      <section className="relative overflow-hidden bg-[#ebe8da] pb-28 text-studio-ink md:pb-40">
        <div className="feather-edges relative -ml-[50vw] aspect-video w-[150vw] md:absolute md:right-0 md:top-0 md:ml-0 md:w-[64vw] md:max-w-[1100px]">
          <ClipVideo
            src="/video/flatlay.mp4"
            poster="/video/flatlay-start.webp"
            stillPoster="/video/flatlay-end.webp"
            label={
              lang === "de"
                ? "Burger-Zutaten legen sich von oben gesehen zurecht"
                : "Burger ingredients arrange themselves, seen from above"
            }
          />
        </div>
        <div className="relative mx-auto -mt-6 flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 md:mt-0 md:flex-col md:items-start md:justify-end md:gap-6 md:min-h-[min(36vw,620px)] md:pb-14 md:pt-28">
          <h2 className="display text-[clamp(2.6rem,5vw,4.6rem)] md:max-w-[12ch]">
            {t.lineup.title}
          </h2>
          <Link
            href="/menu"
            className="group inline-flex shrink-0 items-center gap-2 font-semibold transition-colors hover:text-ketchup"
          >
            {t.lineup.all}
            <ArrowRight
              size={16}
              weight="bold"
              className="transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
        <ul className="rail mt-10 flex gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {lineup.map((item) => (
            <li key={item.id} className="w-[72vw] max-w-[320px] shrink-0">
              <OpenItemButton
                slug={item.slug}
                className="group block w-full text-left"
              >
                <span className="relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[0_24px_50px_-28px_rgb(22_24_26/0.45)]">
                  <Image
                    src={item.image!}
                    alt=""
                    fill
                    sizes="320px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {item.tag ? (
                    <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-ink">
                      {t.tags[item.tag]}
                    </span>
                  ) : null}
                </span>
                <span className="mt-4 flex items-baseline justify-between gap-3">
                  <span className="display text-3xl">
                    {pick(item, "name", lang)}
                  </span>
                  <span className="font-semibold tabular-nums text-studio-ink/70">
                    {formatPrice(item.price_cents, lang)}
                  </span>
                </span>
              </OpenItemButton>
            </li>
          ))}
        </ul>
      </section>

      {/* Pickup / delivery */}
      <section className="relative isolate overflow-hidden bg-grill">
        <ClipVideo
          src="/video/bg-street.mp4"
          poster="/video/bg-street.webp"
          loop
          className="-z-10 opacity-80"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgb(10 11 12 / 0.85) 0%, rgb(10 11 12 / 0.35) 45%, rgb(10 11 12 / 0.55) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 md:py-40">
          <h2 className="display text-[clamp(2.6rem,5vw,4.6rem)]">
            {t.ways.title}
          </h2>
          <div className="mt-10 grid gap-3 md:grid-cols-[1.25fr_1fr]">
            <div className="group relative min-h-[360px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-grill/80 backdrop-blur-sm">
              <Image
                src="/img/b8.jpg"
                alt=""
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover opacity-60 transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-grill via-grill/70 to-grill/10"
                aria-hidden="true"
              />
              <div className="relative flex h-full flex-col justify-end p-8">
                <Storefront
                  size={36}
                  weight="duotone"
                  className="text-ketchup"
                  aria-hidden
                />
                <h3 className="display mt-4 text-6xl">{t.ways.pickupTitle}</h3>
                <p className="mt-3 max-w-[38ch] text-ink">
                  {t.ways.pickupBody}
                </p>
              </div>
            </div>
            <div className="relative isolate flex min-h-[480px] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-[#ece7da] p-8 text-studio-ink md:min-h-[360px]">
              <div className="feather-edges absolute inset-x-0 top-0 -z-10 h-[64%] md:inset-y-0 md:left-[30%] md:right-0 md:h-auto">
                <ClipVideo
                  src="/video/bag.mp4"
                  poster="/video/bag-start.webp"
                  stillPoster="/video/bag-end.webp"
                  className="object-[100%_50%]"
                  label={
                    lang === "de"
                      ? "Burgerbox und Pommes rutschen in eine Papiertüte, die sich schließt"
                      : "A burger box and fries slide into a paper bag that folds shut"
                  }
                />
              </div>
              <Bicycle size={36} weight="duotone" className="text-ketchup" aria-hidden />
              <h3 className="display mt-4 text-6xl">{t.ways.deliveryTitle}</h3>
              <p className="mt-3 max-w-[38ch] text-studio-ink/85 md:max-w-[22ch]">
                {fill(t.ways.deliveryBody, {
                  min: formatPrice(settings.delivery.min_cents, lang),
                  fee: formatPrice(settings.delivery.fee_cents, lang),
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action: huge order line with a burger inside the type, then the visit details */}
      <section id="visit" className="scroll-mt-24">
        <div className="relative isolate overflow-hidden bg-ketchup text-ketchup-ink">
          <ClipVideo
            src="/video/bg-ketchup.mp4"
            poster="/video/bg-ketchup.webp"
            loop
            className="-z-10 object-[80%_70%]"
          />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(90deg, rgb(150 32 22 / 0.72) 0%, rgb(150 32 22 / 0.45) 50%, transparent 85%)",
            }}
            aria-hidden="true"
          />
          <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 md:py-40">
            <h2 className="display max-w-6xl text-[clamp(3.2rem,8vw,8rem)] [text-shadow:0_4px_30px_rgb(90_15_10/0.35)]">
              {t.cta.before}{" "}
              <span
                className="mx-1 inline-block h-[0.78em] w-[1.9em] rounded-full bg-cover bg-center align-[-0.06em]"
                style={{ backgroundImage: "url(/img/b1.jpg)" }}
                aria-hidden="true"
              />{" "}
              {t.cta.after}
            </h2>
            <Link
              href="/menu"
              className="btn mt-10 bg-ketchup-ink px-8 py-5 text-xl text-ketchup hover:bg-grill hover:text-ketchup-ink"
            >
              {t.cta.button}
              <ArrowRight size={20} weight="bold" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="relative isolate overflow-hidden bg-grill">
          <ClipVideo
            src="/video/bg-griddle.mp4"
            poster="/video/bg-griddle.webp"
            loop
            className="-z-10 object-[70%_60%]"
          />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(90deg, rgb(10 11 12 / 0.88) 0%, rgb(10 11 12 / 0.7) 45%, rgb(10 11 12 / 0.35) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 md:grid-cols-2 md:py-36">
            <div>
              <h3 className="display text-5xl">{t.visit.title}</h3>
              <p className="mt-4 text-2xl font-medium text-ink">
                {t.visit.address}
              </p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-3 self-end text-lg">
              {hours.map((h) => (
                <div key={h!.day} className="contents">
                  <dt className="font-medium">{t.days[h!.day]}</dt>
                  <dd className="tabular-nums text-ink/85">
                    {h!.closed ? t.visit.closed : `${h!.open} - ${h!.close}`}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
