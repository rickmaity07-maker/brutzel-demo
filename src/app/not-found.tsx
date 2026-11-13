import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BRAND } from "@/brand.config";
import { ClipVideo } from "@/components/shop/ClipVideo";
import { getDict } from "@/lib/lang";

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-grill px-4 text-grill-ink">
      <ClipVideo
        src="/video/bg-griddle.mp4"
        srcMobile="/video/bg-griddle-m.mp4"
        poster="/video/bg-griddle.webp"
        loop
        className="-z-10 opacity-70"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(70% 60% at 50% 45%, rgb(10 11 12 / 0.55), rgb(10 11 12 / 0.92))" }}
        aria-hidden="true"
      />
      <div className="max-w-2xl text-center">
        <Link href="/" className="display text-4xl text-ketchup">
          {BRAND.name}
        </Link>
        <p className="display mt-10 text-[clamp(5rem,18vw,11rem)] leading-none text-ink/15" aria-hidden="true">
          404
        </p>
        <h1 className="display -mt-6 text-[clamp(2.6rem,7vw,5rem)]">{t.notFound.title}</h1>
        <p className="mx-auto mt-5 max-w-[40ch] text-lg text-ink/85">{t.notFound.body}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/menu" className="btn btn-primary">
            {t.notFound.menu}
            <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
          <Link href="/" className="btn btn-ghost">
            {t.notFound.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
